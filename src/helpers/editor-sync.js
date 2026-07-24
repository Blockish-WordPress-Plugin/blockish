/**
 * Custom Editor Sync
 * Polls the backend every 3 seconds to check if the AI has explicitly requested a refresh.
 * Saves unsaved edits first; reloads only after a successful save.
 */
(function() {
    if (typeof wp === 'undefined' || typeof wp.data === 'undefined' || typeof wp.apiFetch === 'undefined') {
        return;
    }

    let isPolling = false;
    let pollInterval = null;
    let isBusy = false;

    const getDirtyEntityRecords = () => {
        const core = wp.data.select('core');
        if (core && typeof core.__experimentalGetDirtyEntityRecords === 'function') {
            const dirty = core.__experimentalGetDirtyEntityRecords();
            if (Array.isArray(dirty) && dirty.length > 0) {
                return dirty;
            }
        }
        return [];
    };

    /**
     * WP may still have beforeunload attached briefly after save.
     * Suppress it so a confirmed save can reload cleanly.
     */
    const reloadEditor = () => {
        isBusy = true;

        window.addEventListener(
            'beforeunload',
            (event) => {
                event.stopImmediatePropagation();
            },
            { capture: true }
        );

        window.location.reload();
    };

    /**
     * Save the current editor post the same way the Save button does:
     * serialize blocks → saveEntityRecord. Plain saveEditedEntityRecord alone
     * often has nothing queued and silently no-ops.
     */
    const saveCurrentEditorPost = async () => {
        const editorSelect = wp.data.select('core/editor');
        const editorDispatch = wp.data.dispatch('core/editor');
        const coreSelect = wp.data.select('core');

        if (!editorSelect || typeof editorSelect.isEditedPostDirty !== 'function') {
            return true;
        }

        if (!editorSelect.isEditedPostDirty()) {
            return true;
        }

        if (typeof editorSelect.isEditedPostSaveable === 'function' && !editorSelect.isEditedPostSaveable()) {
            console.error('Blockish AI Refresh: post is not saveable');
            return false;
        }

        const postType = editorSelect.getCurrentPostType();
        const postId = editorSelect.getCurrentPostId();

        await editorDispatch.savePost();

        const saveError = coreSelect.getLastEntitySaveError('postType', postType, postId);
        if (saveError) {
            console.error('Blockish AI Refresh: savePost failed', saveError);
            return false;
        }

        if (editorSelect.isEditedPostDirty()) {
            console.error('Blockish AI Refresh: post still dirty after savePost');
            return false;
        }

        return true;
    };

    /**
     * Persist any other dirty entities (site settings, templates, etc.).
     */
    const saveOtherDirtyEntities = async () => {
        const coreDispatch = wp.data.dispatch('core');
        const coreSelect = wp.data.select('core');
        const editorSelect = wp.data.select('core/editor');

        const postType = editorSelect ? editorSelect.getCurrentPostType() : null;
        const postId = editorSelect ? editorSelect.getCurrentPostId() : null;

        const dirty = getDirtyEntityRecords().filter((record) => {
            if (!postType || postId === null || postId === undefined) {
                return true;
            }
            return !(
                record.kind === 'postType' &&
                record.name === postType &&
                String(record.key) === String(postId)
            );
        });

        for (const record of dirty) {
            const saved = await coreDispatch.saveEditedEntityRecord(
                record.kind,
                record.name,
                record.key
            );

            if (!saved) {
                console.error('Blockish AI Refresh: saveEditedEntityRecord failed', record);
                return false;
            }

            const saveError = coreSelect.getLastEntitySaveError(
                record.kind,
                record.name,
                record.key
            );
            if (saveError) {
                console.error('Blockish AI Refresh: entity save error', record, saveError);
                return false;
            }
        }

        return true;
    };

    const requestReload = async () => {
        if (isBusy) {
            return;
        }
        isBusy = true;

        try {
            const postSaved = await saveCurrentEditorPost();
            if (!postSaved) {
                isBusy = false;
                return;
            }

            const entitiesSaved = await saveOtherDirtyEntities();
            if (!entitiesSaved) {
                isBusy = false;
                return;
            }

            reloadEditor();
        } catch (error) {
            console.error('Blockish AI Refresh: save error — reload skipped', error);
            isBusy = false;
        }
    };

    wp.data.subscribe(() => {
        if (isPolling) return;

        const editor = wp.data.select('core/editor');

        let isReady = false;

        if (editor && editor.__unstableIsEditorReady && editor.__unstableIsEditorReady()) {
            isReady = true;
        }

        let initialPostId = editor ? editor.getCurrentPostId() : null;

        if (!isReady || !initialPostId) return;

        isPolling = true;

        pollInterval = setInterval(() => {
            if (isBusy) return;

            const editorStore = wp.data.select('core/editor');

            // Don't sync if the user is currently saving
            if (editorStore && editorStore.isSavingPost && editorStore.isSavingPost()) return;

            let postId = editorStore ? editorStore.getCurrentPostId() : null;

            if (!postId) return;

            wp.apiFetch({ path: `/blockish/v1/check-refresh?post_id=${encodeURIComponent(postId)}` })
                .then((response) => {
                    if (response && response.refresh) {
                        console.log('Blockish AI Refresh triggered!');
                        requestReload();
                    }
                })
                .catch(() => {
                    // Ignore transient network errors
                });

        }, 3000); // Check every 3 seconds
    });
})();
