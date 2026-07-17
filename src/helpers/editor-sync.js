/**
 * Custom Editor Sync
 * Polls the backend every 3 seconds to check if the AI has explicitly requested a refresh.
 */
(function() {
    if (typeof wp === 'undefined' || typeof wp.data === 'undefined' || typeof wp.apiFetch === 'undefined') {
        return;
    }

    let isPolling = false;
    let pollInterval = null;

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
            const editorStore = wp.data.select('core/editor');

            // Don't sync if the user is currently saving
            if (editorStore && editorStore.isSavingPost && editorStore.isSavingPost()) return;

            let postId = editorStore ? editorStore.getCurrentPostId() : null;

            if (!postId) return;

            wp.apiFetch({ path: `/blockish/v1/check-refresh?post_id=${encodeURIComponent(postId)}` })
                .then((response) => {
                    if (response && response.refresh) {
                        console.log('Blockish AI Refresh triggered! Reloading page...');
                        
                        isPolling = false;
                        clearInterval(pollInterval);
                        
                        const checkAndReload = () => {
                            if (editorStore && editorStore.isEditedPostDirty && editorStore.isEditedPostDirty()) {
                                console.log('Blockish AI: Saving dirty post before refresh...');
                                wp.data.dispatch('core/editor').savePost();
                                
                                const waitInterval = setInterval(() => {
                                    if (!editorStore.isSavingPost()) {
                                        clearInterval(waitInterval);
                                        window.location.reload();
                                    }
                                }, 500);
                            } else {
                                window.location.reload();
                            }
                        };
                        checkAndReload();
                    }
                })
                .catch((err) => {
                    // Ignore transient network errors
                });

        }, 3000); // Check every 3 seconds
    });
})();
