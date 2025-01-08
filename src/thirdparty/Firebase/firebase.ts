import { collection, addDoc, getDoc, getDocs, deleteDoc, query, orderBy, setDoc, doc, limit } from "firebase/firestore";
import { firestore } from "./config";

interface SheetData {
    [key: string]: any[];
}

export const uploadDataToFirestore = async (allSheetsData: SheetData): Promise<void> => {
    if (!allSheetsData || Object.keys(allSheetsData).length === 0) {
        console.error("No data to upload");
        return;
    }

    try {
        for (const [sheetName, jsonData] of Object.entries(allSheetsData)) {
            // Lọc dữ liệu không hợp lệ
            const filteredData = jsonData.filter(item => {
                return Object.values(item).every(value => value !== '/'); // Loại bỏ dòng chứa '/'
            });

            if (filteredData.length === 0) {
                console.error(`No valid data to upload for sheet ${sheetName}`);
                alert(`No valid data found in the sheet ${sheetName}.`);
                continue;
            }

            const collectionRef = collection(firestore, `excelData_${sheetName}`);

            // Delete existing documents in the collection
            const querySnapshot = await getDocs(collectionRef);
            const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deletePromises);

            // Store column headers separately
            const headers = Object.keys(filteredData[0]);
            const headersDocRef = doc(firestore, `excelData_${sheetName}`, 'headers');
            await setDoc(headersDocRef, { headers });

            // Add new data to the collection with an index
            for (let index = 0; index < filteredData.length; index++) {
                const item = { ...filteredData[index], _index: index };
                console.log(`Uploading data for sheet ${sheetName}:`, item);
                await addDoc(collectionRef, item);
            }
        }
        alert("Data uploaded successfully!");
    } catch (error) {
        console.error("Error uploading data:", error);
        alert("Failed to upload data");
    }
};

export const fetchDataFromFirestore = async (sheetNames: string[]): Promise<SheetData> => {
    try {
        const allSheetsData: SheetData = {};

        for (const sheetName of sheetNames) {
            const collectionRef = collection(firestore, `excelData_${sheetName}`);

            // Get headers for ordering
            const headersDocRef = doc(firestore, `excelData_${sheetName}`, 'headers');
            const headersDoc = await getDoc(headersDocRef);
            const headers = headersDoc.exists() ? headersDoc.data().headers : [];

            const q = query(collectionRef, orderBy('_index'));
            const querySnapshot = await getDocs(q);

            // Transform data maintaining key order
            const jsonData = querySnapshot.docs
                .filter(doc => doc.id !== 'headers')
                .map(doc => {
                    const rowData = doc.data();
                    const { _index, ...rest } = rowData;

                    // Create new object with ordered keys
                    return headers.reduce((orderedObj: any, key: string) => {
                        if (key in rest) {
                            orderedObj[key] = rest[key];
                        }
                        return orderedObj;
                    }, {});
                });

            allSheetsData[sheetName] = jsonData;
        }
        console.log("Fetched data from Firestore:", allSheetsData);
        return allSheetsData;
    } catch (error) {
        console.error("Error fetching data from Firestore:", error);
        throw error;
    }
};

interface Message {
    id: string;
    createdAt: { seconds: number };
    email: string;
    isNew: boolean;
    message: string;
    name: string;
    subject: string;
}

export const fetchMessagesWithPagination = async (
    page: number,
    pageSize: number
): Promise<{ messages: Message[]; total: number }> => {
    try {
        const collectionRef = collection(firestore, 'messages');

        const q = query(
            collectionRef,
            orderBy('isNew', 'desc'),     // Show new messages first
            orderBy('createdAt', 'desc'),  // Then by date
            limit((page * pageSize) + 1)
        );

        const querySnapshot = await getDocs(q);
        const hasMore = querySnapshot.docs.length > page * pageSize;

        const messages = querySnapshot.docs
            .slice((page - 1) * pageSize, page * pageSize)
            .map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt
            })) as Message[];

        const total = (page * pageSize) + (hasMore ? 1 : 0);

        return { messages, total };
    } catch (error) {
        console.error("Error fetching messages:", error);
        throw error;
    }
};
export const getMessageById = async (id: string): Promise<Message> => {
    try {
        const docRef = doc(firestore, 'messages', id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            throw new Error('Message not found');
        }

        return docSnap.data() as Message;
    } catch (error) {
        console.error("Error fetching message:", error);
        throw error;
    }
};
export const markMessageAsRead = async (id: string): Promise<void> => {
    try {
        const docRef = doc(firestore, 'messages', id);
        await setDoc(docRef, { isNew: false }, { merge: true });
    } catch (error) {
        console.error("Error marking message as read:", error);
        throw error;
    }
}
