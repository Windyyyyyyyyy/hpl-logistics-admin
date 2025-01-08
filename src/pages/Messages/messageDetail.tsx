import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { getMessageById, markMessageAsRead } from '../../thirdparty/Firebase/firebase';

interface Message {
    id: String;
    createdAt: { seconds: number };
    email: string;
    isNew: boolean;
    message: string;
    name: string;
    subject: string;
}

export default function MessageDetail() {
    const { id } = useParams();
    const [message, setMessage] = React.useState<Message | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchMessage = async () => {
            if (!id) return;
            try {
                const messageData = await getMessageById(id);
                setMessage(messageData);
                await markMessageAsRead(id);
            } catch (error) {
                console.error("Error fetching message:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMessage();
    }, [id]);

    if (loading) return <div className="p-6">Loading...</div>;
    if (!message) return <div className="p-6">Message not found</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <Link 
                to="/admin/messages" 
                className="mb-6 inline-block text-blue-500 hover:underline"
            >
                ← Back to Messages
            </Link>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="border-b pb-4 mb-4">
                    <h1 className="text-2xl font-bold mb-2">{message.subject}</h1>
                    <div className="flex justify-between items-center text-gray-600">
                        <div>
                            <p className="font-medium">{message.name}</p>
                            <p>{message.email}</p>
                        </div>
                        <p>
                            {format(new Date(message.createdAt.seconds * 1000), 'PPpp')}
                        </p>
                    </div>
                </div>
                
                <div className="whitespace-pre-wrap">
                    {message.message}
                </div>

                {message.isNew && (
                    <span className="inline-block px-2 py-1 text-xs bg-blue-500 text-white rounded mt-4">
                        New
                    </span>
                )}
            </div>
        </div>
    );
}