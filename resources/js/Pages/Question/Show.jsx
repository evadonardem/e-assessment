import { Editor } from '@tinymce/tinymce-react'
import Layout from '../Layout'

const Show = () => {
  return (
    <>
      <h1>Question</h1>
      <Editor
        apiKey='pm89xh1s4bq3cgrn1232293tudye2x5lddh0siu6z65iflfq'/>
    </>
  );
};

Show.layout = page => <Layout children={page} title="Show Question"/>

export default Show;