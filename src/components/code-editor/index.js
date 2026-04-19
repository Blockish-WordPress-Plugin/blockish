import { BaseControl, TextareaControl } from '@wordpress/components';
import { useEffect, useRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const BlockishCodeEditor = ( {
    label = __( 'Code Editor', 'blockish' ),
    value = '',
    onChange,
    settings = {},
    help = '',
    rows = 8,
    ...props
} ) => {
    const containerRef = useRef( null );
    const textareaRef = useRef( null );
    const editorRef = useRef( null );
    const lastEditorValueRef = useRef( value || '' );

    useEffect( () => {
        if ( ! textareaRef.current && containerRef.current ) {
            textareaRef.current = containerRef.current.querySelector( 'textarea' );
        }

        if ( editorRef.current || ! window?.wp?.codeEditor || ! textareaRef.current ) {
            return;
        }

        const {
            extraKeys: providedExtraKeys = {},
            hintOptions: providedHintOptions = {},
            ...restSettings
        } = settings || {};

        const CodeMirrorGlobal = window?.CodeMirror;
        const resolvedHintProvider =
            CodeMirrorGlobal?.hint?.css ||
            CodeMirrorGlobal?.hint?.anyword ||
            null;
        const autocompleteKeyHandler = (instance) => {
            if ( !instance?.showHint ) {
                return;
            }

            instance.showHint( {
                hint: resolvedHintProvider || undefined,
                completeSingle: false,
            } );
        };

        const editor = window.wp.codeEditor.initialize( textareaRef.current, {
            codemirror: {
                lineNumbers: true,
                indentUnit: 4,
                tabSize: 4,
                autoCloseBrackets: true,
                matchBrackets: true,
                extraKeys: {
                    'Ctrl-Space': autocompleteKeyHandler,
                    ...providedExtraKeys,
                },
                hintOptions: {
                    completeSingle: false,
                    ...providedHintOptions,
                },
                ...restSettings,
            },
        } );

        const codeMirror = editor?.codemirror;
        if ( ! codeMirror ) {
            return;
        }

        editorRef.current = editor;

        const canShowHints = Boolean(
            codeMirror?.showHint &&
            resolvedHintProvider
        );

        if ( canShowHints ) {
            codeMirror.on( 'inputRead', ( instance, changeObj ) => {
                const input = changeObj?.text?.join( '' ) || '';
                const isLikelyCssInput = /^[a-zA-Z\-:._#@$]$/.test( input );
                if ( !isLikelyCssInput || instance.state.completionActive ) {
                    return;
                }

                instance.showHint( {
                    hint: resolvedHintProvider,
                    completeSingle: false,
                } );
            } );
        }

        codeMirror.on( 'change', ( instance ) => {
            const nextValue = instance.getValue();
            lastEditorValueRef.current = nextValue;

            if ( typeof onChange === 'function' ) {
                onChange( nextValue );
            }
        } );

        return () => {
            if ( editorRef.current?.codemirror ) {
                editorRef.current.codemirror.toTextArea();
            }
            editorRef.current = null;
        };
    }, [] );

    useEffect( () => {
        if ( ! editorRef.current?.codemirror ) {
            return;
        }

        const nextValue = value || '';
        if ( nextValue === lastEditorValueRef.current ) {
            return;
        }

        const currentValue = editorRef.current.codemirror.getValue();
        if ( currentValue !== nextValue ) {
            editorRef.current.codemirror.setValue( nextValue );
        }
        lastEditorValueRef.current = nextValue;
    }, [ value ] );

    return (
        <div className="blockish-control blockish-code-editor" ref={ containerRef }>
            <BaseControl
                __nextHasNoMarginBottom
                label={ label }
                help={ help }
            >
                <TextareaControl
                    __nextHasNoMarginBottom
                    value={ value || '' }
                    onChange={ onChange }
                    rows={ rows }
                    ref={ textareaRef }
                    className="blockish-code-editor-textarea"
                    { ...props }
                />
            </BaseControl>
        </div>
    );
};

export default BlockishCodeEditor;
