import { useState, useEffect } from 'react';
import { Modal, Notification, Tabs } from '@arco-design/web-react';
import Editor from '@monaco-editor/react';
import graphState from '../hooks/use-graph-state';
import exportSQL from '../utils/export-sql';
import { useTranslation } from 'react-i18next';

const TabPane = Tabs.TabPane;

/**
 * It's a modal that displays the command to be exported
 * @returns Modal component
 */
export default function ExportModal({ showModal, onCloseModal }) {
    const [exportType, setExportType] = useState('dbml');
    const [sqlValue, setSqlValue] = useState('');
    const { t } = useTranslation('modal');
    const { tableDict, linkDict, theme } = graphState.useContainer();

    const copy = async () => {
        try {
            await window.navigator.clipboard.writeText(sqlValue);
            Notification.success({
                title: t('Copy Success'),
            });
        } catch (e) {
            console.log(e);
            Notification.error({
                title: t('Copy Failed'),
            });
        }
    };

    useEffect(() => {
        if (showModal === 'export') {
            const sql = exportSQL(tableDict, linkDict, exportType);
            setSqlValue(sql);
        }
    }, [showModal, exportType]);

    const editor = (
        <Editor
            className={`!mt-0 ${theme === 'dark' ? 'bg-[#1e1e1e]' : ' bg-[#fff]'} mt-[10px]`}
            language={exportType === 'dbml' ? 'apex' : 'sql'}
            width="680px"
            height="60vh"
            theme={theme === 'dark' ? 'vs-dark' : 'light'}
            value={sqlValue}
            options={{
                acceptSuggestionOnCommitCharacter: true,
                acceptSuggestionOnEnter: 'on',
                accessibilitySupport: 'auto',
                autoIndent: false,
                automaticLayout: true,
                codeLens: true,
                colorDecorators: true,
                contextmenu: true,
                cursorBlinking: 'blink',
                cursorSmoothCaretAnimation: false,
                cursorStyle: 'line',
                disableLayerHinting: false,
                disableMonospaceOptimizations: false,
                dragAndDrop: false,
                fixedOverflowWidgets: false,
                folding: true,
                foldingStrategy: 'auto',
                fontLigatures: false,
                formatOnPaste: false,
                formatOnType: false,
                hideCursorInOverviewRuler: false,
                highlightActiveIndentGuide: true,
                links: true,
                mouseWheelZoom: false,
                multiCursorMergeOverlapping: true,
                multiCursorModifier: 'alt',
                overviewRulerBorder: true,
                overviewRulerLanes: 2,
                quickSuggestions: true,
                quickSuggestionsDelay: 100,
                readOnly: false,
                renderControlCharacters: false,
                renderFinalNewline: true,
                renderIndentGuides: true,
                renderLineHighlight: 'line',
                renderWhitespace: 'none',
                revealHorizontalRightPadding: 300,
                roundedSelection: true,
                rulers: [],
                scrollBeyondLastColumn: 5,
                scrollBeyondLastLine: true,
                selectOnLineNumbers: true,
                selectionClipboard: true,
                selectionHighlight: true,
                showFoldingControls: 'mouseover',
                smoothScrolling: false,
                suggestOnTriggerCharacters: true,
                wordBasedSuggestions: true,
                wordSeparators: '~!@#$%^&*()-=+[{]}|;:\'",.<>/?',
                wordWrap: 'wordWrapColumn',
                wordWrapBreakAfterCharacters: '\t})]?|&,;',
                wordWrapBreakBeforeCharacters: '{([+',
                wordWrapBreakObtrusiveCharacters: '.',
                wordWrapColumn: 80,
                wordWrapMinified: true,
                wrappingIndent: 'none',
                // minimap: {
                //     autohide: true,
                // },
            }}
            onChange={setSqlValue}
        />
    );

    return (
        <Modal
            title={null}
            simple
            visible={showModal === 'export'}
            autoFocus={false}
            onOk={() => copy()}
            okText={t('Copy')}
            cancelText={t('Close')}
            onCancel={() => onCloseModal()}
            style={{ width: 'auto' }}
        >
            <h5 className="text-[20px] py-[10px] font-bold">{t('Export ERD Data Model')}</h5>
            <Tabs
                activeTab={exportType}
                onChange={val => setExportType(val)}
                className="ring-2 ring-[#359c899a] p-0 w-[680px]"
            >
                <TabPane key="dbml" title="DBML">
                    {editor}
                </TabPane>
                <TabPane key="postgres" title="PostgreSQL">
                    {editor}
                </TabPane>
                <TabPane key="mysql" title="MySQL">
                    {editor}
                </TabPane>
                <TabPane key="mssql" title="MSSQL">
                    {editor}
                </TabPane>
            </Tabs>
        </Modal>
    );
}
