import Layout from '../Layout'

const Show = () => {
  return (
    <>
      <h1>Question</h1>
    </>
  );
};

Show.layout = page => <Layout children={page} title="Show Question"/>

export default Show;