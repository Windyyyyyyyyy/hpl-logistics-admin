import React from 'react';
import { fetchMessagesWithPagination } from '../../thirdparty/Firebase/firebase';
import { format } from 'date-fns';
import { Link } from 'react-router';

interface Message {
  id: string;
  createdAt: { seconds: number };
  email: string;
  isNew: boolean;
  message: string;
  name: string;
  subject: string;
}

export default function Messages() {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const PAGE_SIZE = 10;

  console.log('messages ', messages);

  const fetchMessages = async (page: number) => {
    try {
      setLoading(true);
      const { messages: newMessages, total } = await fetchMessagesWithPagination(page, PAGE_SIZE);
      setMessages(newMessages);
      setTotalPages(Math.ceil(total / PAGE_SIZE));
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchMessages(currentPage);
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Messages</h1>

      <div className="space-y-4">
        {messages.map((message, index) => (
          <Link
            key={index}
            to={`/admin/messages/${message.id}`}
            className={`block rounded-lg border p-4 ${
              message.isNew ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            } transition-shadow hover:shadow-md`}
          >
            <div className="mb-2 flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{message.subject}</h3>
                <p className="text-sm text-gray-600">{message.name}</p>
                <p className="text-sm text-gray-500">{message.email}</p>
              </div>
              <span className="text-sm text-gray-500">
                {format(new Date(message.createdAt.seconds * 1000), 'PPpp')}
              </span>
            </div>

            <p className="text-gray-700">{truncateText(message.message)}</p>

            {message.isNew && (
              <span className="mt-2 inline-block rounded bg-blue-500 px-2 py-1 text-xs text-white">
                New
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="mt-4 flex justify-center gap-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="rounded border px-3 py-1 disabled:opacity-50"
        >
          Previous
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`rounded border px-3 py-1 ${
              currentPage === page ? 'bg-blue-500 text-white' : ''
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="rounded border px-3 py-1 disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {loading && <div className="mt-4 text-center">Loading...</div>}
    </div>
  );
}
