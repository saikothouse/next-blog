import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import YouTubeEmbed from '../components/YouTubeEmbed';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { solarizedlight } from 'react-syntax-highlighter/dist/esm/styles/prism';

const Post = async ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const filePath = path.join(process.cwd(), 'posts', `${id}.md`);

  if (!fs.existsSync(filePath)) {
    notFound();
  }

  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);
  const processedContent = await remark().use(html).process(content);
  const contentHtml = processedContent.toString();

  // Convert HTML to React components
  const contentWithComponents = contentHtml.replace(
    /<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g,
    (match, lang, code) => {
      return (
        <SyntaxHighlighter language={lang} style={solarizedlight}>
          {code}
        </SyntaxHighlighter>
      );
    }
  ).replace(
    /<iframe.*?src="https:\/\/www\.youtube\.com\/embed\/(\w+)".*?><\/iframe>/g,
    (match, videoId) => {
      return <YouTubeEmbed videoId={videoId} />;
    }
  );

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-2xl mx-auto mt-8">
      <h1 className="text-3xl font-bold mb-4">{data.title}</h1>
      <p className="text-gray-600 text-sm mb-4">{new Date(data.date).toLocaleDateString()}</p>
      <div className="mt-4" dangerouslySetInnerHTML={{ __html: contentWithComponents }} />
      <Link href="/" className="mt-6 inline-block text-blue-600 hover:underline">
        Back to Home
      </Link>
    </div>
  );
};

export default Post;
