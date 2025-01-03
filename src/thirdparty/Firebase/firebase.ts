import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { firestore } from "./config";

export const uploadDataToFirestore = async (allSheetsData: { [key: string]: any[] }) => {
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

            // Add new data to the collection
            for (const item of filteredData) {
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