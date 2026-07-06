import { knowledgeService } from "@/features/knowledge/services/knowledge.service";
import Link from "next/link";
import { KnowledgeBase } from "@/types";
import { Button } from "@/components/ui/button";

export default async function KnowledgePage() {
  let articles = [];
  try {
    articles = await knowledgeService.getArticles();
  } catch (err) {
    console.error("Error fetching articles:", err);
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Knowledge Base</h1>
        <Link href="/knowledge/create">
          <Button>Create Article</Button>
        </Link>
      </div>
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {articles?.map((article: KnowledgeBase) => (
              <tr key={article.id}>
                <td className="px-6 py-4 whitespace-nowrap">{article.title}</td>
                <td className="px-6 py-4 whitespace-nowrap">{article.category}</td>
                <td className="px-6 py-4 whitespace-nowrap">{article.status}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link href={`/knowledge/${article.id}/edit`} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</Link>
                  <Link href={`/knowledge/${article.id}`} className="text-blue-600 hover:text-blue-900">View</Link>
                </td>
              </tr>
            ))}
            {(!articles || articles.length === 0) && (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No articles found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
