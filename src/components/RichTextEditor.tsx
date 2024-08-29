import React, {useRef, useState, useEffect } from 'react';
import { Editor, EditorState, RichUtils, convertToRaw, convertFromRaw, CompositeDecorator } from 'draft-js';
import 'draft-js/dist/Draft.css';
/* eslint-disable @typescript-eslint/no-explicit-any */
// Helper function to find tags like #important
const findTag = (contentBlock: any, callback: any) => {
  const text = contentBlock.getText();
  const regex = /\#[a-zA-Z0-9]+/g; //eslint-disable-line
  let matchArr, start;
  while ((matchArr = regex.exec(text)) !== null) {
    start = matchArr.index;
    callback(start, start + matchArr[0].length);
  }
};

// Component to render tags with a distinct style
const TagSpan = (props: any) => {
  return <span style={{ color: 'blue', fontWeight: 'bold' }}>{props.children}</span>;
};

// The main RichTextEditor component
const RichTextEditor: React.FC = () => {
  const decorator = new CompositeDecorator([
    {
      strategy: findTag,
      component: TagSpan,
    },
  ]);

  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty(decorator)
  );

  // Load content from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('content');
    if (savedData) {
      const contentState = convertFromRaw(JSON.parse(savedData));
      setEditorState(EditorState.createWithContent(contentState, decorator));
    }
  }, [decorator]);

  // Handle formatting commands (bold, italic, underline)
  const handleKeyCommand = (command: string, editorState: EditorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return 'handled';
    }
    return 'not-handled';
  };

  // Functions for handling toolbar actions
  const onBoldClick = () => setEditorState(RichUtils.toggleInlineStyle(editorState, 'BOLD'));
  const onItalicClick = () => setEditorState(RichUtils.toggleInlineStyle(editorState, 'ITALIC'));
  const onUnderlineClick = () => setEditorState(RichUtils.toggleInlineStyle(editorState, 'UNDERLINE'));
  const onBulletClick = () => setEditorState(RichUtils.toggleBlockType(editorState, 'unordered-list-item'));

  // Save the current content to localStorage
  const saveContent = () => {
    const contentState = editorState.getCurrentContent();
    const rawContent = convertToRaw(contentState);
    localStorage.setItem('content', JSON.stringify(rawContent));
  };
  const [date, setDate] = useState<any>('');//eslint-disable-line
  const dateInputRef = useRef(null);
  const handleChange = (e: any) => {
    setDate(e.target.value);
  };

  return (
    <div>
        <div className='toolbar'>
        <label htmlFor="date">Date:</label>
        <input
        name='date'
        type="date"
        onChange={handleChange}
        ref={dateInputRef}
      />
    </div>
    <div className='toolbar'>
    <label htmlFor="folder">Folder:</label>
    <select className='categories' name="folder">
            <option value="apple">Apple</option>
            <option value="banana">Banana</option>
            <option value="orange">Orange</option>
    </select>
    </div>    
        
      <div className="toolbar">
        <button onClick={onBoldClick}><b>B</b></button>
        <button onClick={onItalicClick}><i>I</i></button>
        <button onClick={onUnderlineClick}><u>U</u></button>
        <button onClick={onBulletClick}>•</button>
        <button onClick={saveContent}>Save</button>
      </div>
      <div className="editor">
        <Editor
          editorState={editorState}
          handleKeyCommand={handleKeyCommand}
          onChange={setEditorState}
        />
      </div>
    </div>
  );
};

export default RichTextEditor;
