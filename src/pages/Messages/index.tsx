import React from 'react';
import { fetchMessagesWithPagination } from '../../thirdparty/Firebase/firebase';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

interface Message {
    id : string;
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

    console.log("messages ", messages);

    const fetchMessages = async (page: number) => {
        try {
            setLoading(true);
            const { messages: newMessages, total } = await fetchMessagesWithPagination(page, PAGE_SIZE);
            setMessages(newMessages);
            setTotalPages(Math.ceil(total / PAGE_SIZE));
        } catch (error) {
            console.error("Error fetching messages:", error);
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
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Messages</h1>

            <div className="space-y-4">
                {messages.map((message, index) => (
                    <Link
                        key={index}
                        to={`/admin/messages/${message.id}`}
                        className={`block p-4 rounded-lg border ${
                            message.isNew ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        } hover:shadow-md transition-shadow`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="font-semibold">{message.subject}</h3>
                                <p className="text-sm text-gray-600">{message.name}</p>
                                <p className="text-sm text-gray-500">{message.email}</p>
                            </div>
                            <span className="text-sm text-gray-500">
                                {format(new Date(message.createdAt.seconds * 1000), 'PPpp')}
                            </span>
                        </div>

                        <p className="text-gray-700">
                           
                            {truncateText(message.message)}
                        </p>
                        
                    

                        {message.isNew && (
                            <span className="inline-block px-2 py-1 text-xs bg-blue-500 text-white rounded mt-2">
                                New
                            </span>
                        )}
                    </Link>
                ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center gap-2 mt-4">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded border disabled:opacity-50"
                >
                    Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 rounded border ${currentPage === page ? 'bg-blue-500 text-white' : ''
                            }`}
                    >
                        {page}
                    </button>
                ))}

                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded border disabled:opacity-50"
                >
                    Next
                </button>
            </div>

            {loading && (
                <div className="text-center mt-4">Loading...</div>
            )}
        </div>
    );
}