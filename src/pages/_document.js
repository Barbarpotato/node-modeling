import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>

        <title>Node Modeling</title>
        <link rel="icon" type="image/png" href="/node.png" />

        <meta charset="UTF-8"></meta>
        <meta name="description" content="Node Modeling is similiar like BPMN (Business Process Model and Notation), that can visually map out business processes & rules. This is used for development phase that sometimes make us overwhelming to describe our rules and process in Business Logic ( developing & maintaining complex business logic application )." />
        <meta name="keywords" content="development, web application, business process modeling" />
        <meta name="author" content="Darmawan"></meta>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
