import React from 'react'
import Layout from '../Layout'

const Show = () => {
  return <React.Fragment>
      <h1>Question</h1>
  </React.Fragment>;
};

Show.layout = page => <Layout title="Show Question">{page}</Layout>

export default Show;