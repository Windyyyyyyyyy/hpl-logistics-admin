import React from 'react';
import * as XLSX from 'xlsx';
import Spreadsheet from "react-spreadsheet";
import { useTranslation } from 'react-i18next';
import { uploadDataToFirestore, fetchDataFromFirestore } from '../../thirdparty/Firebase/firebase';

interface Cell {
    value: any;
}

interface SheetData {
    [key: string]: Cell[][];
}

const LOCAL_STORAGE_KEY = 'excelData';
const EXPIRATION_TIME = 24 * 60 * 60 * 1000; // 24 hours

function FileInput() {
    const [data, setData] = React.useState<SheetData>({});
    const [isOpen, setIsOpen] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [sheets, setSheets] = React.useState<string[]>([]);
    const [currentSheet, setCurrentSheet] = React.useState<string>('');
    const [workbook, setWorkbook] = React.useState<XLSX.WorkBook | null>(null);
    const [fileName, setFileName] = React.useState<string>('');
    const { t } = useTranslation();

    console.log("data[currentSheet] ", currentSheet);
    const loadSheet = (workbook: XLSX.WorkBook, sheetName: string) => {
        const sheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

        const formattedData = rawData.map((row) =>
            row.map((cell) => ({
                value: cell ?? ''
            }))
        );

        setData((prevData) => ({
            ...prevData,
            [sheetName]: formattedData
        }));
        setCurrentSheet(sheetName);
    };
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;
        const file = files[0];
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                setIsLoading(true);
                if (e.target && e.target.result) {
                    const data = new Uint8Array(e.target.result as ArrayBuffer);
                    const workbook = XLSX.read(data, { type: 'array' });
                    setWorkbook(workbook);
                    setSheets(workbook.SheetNames);

                    const allSheetsData: { [key: string]: any[] } = {};
                    workbook.SheetNames.forEach((sheetName) => {
                        const sheet = workbook.Sheets[sheetName];
                        const jsonData = XLSX.utils.sheet_to_json(sheet); // Chuyển dữ liệu thành JSON
                        allSheetsData[sheetName] = Array.isArray(jsonData) ? jsonData : [];
                    });

                    console.log(allSheetsData); // Xem dữ liệu JSON

                    // Save JSON data to Firestore
                    await uploadDataToFirestore(allSheetsData);

                    // Cache data locally with timestamp
                    const cacheData = {
                        timestamp: Date.now(),
                        data: allSheetsData
                    };
                    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cacheData));

                    // Load data into the table
                    loadSheet(workbook, workbook.SheetNames[0]);
                }
            } catch (error) {
                console.error('Error reading file:', error);
            } finally {
                setIsLoading(false);
                setFileName(file.name);
            }
        };

        reader.readAsArrayBuffer(file);
    };

    // Load cached data or fetch from Firestore on component mount
    React.useEffect(() => {
        const cachedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (cachedData) {
            const { timestamp, data } = JSON.parse(cachedData);
            if (Date.now() - timestamp < EXPIRATION_TIME) {
                const formattedData = Object.keys(data).reduce((acc, sheetName) => {
                    acc[sheetName] = Array.isArray(data[sheetName]) ? data[sheetName].map((row: any) =>
                        Object.keys(row).map(key => ({
                            value: row[key] ?? ''
                        }))
                    ) : [];
                    return acc;
                }, {} as SheetData);
                setData(formattedData);
                setSheets(Object.keys(formattedData));
                setCurrentSheet(Object.keys(formattedData)[0]);
            }
        } else {
            console.log("Fetching data from Firestore...");
            fetchDataFromFirestore(["FCL", "LCL"])
                .then((allSheetsData) => {
                    // Transform data for Spreadsheet component
                    const transformedData = Object.keys(allSheetsData).reduce((acc, sheetName) => {
                        acc[sheetName] = allSheetsData[sheetName].map(row =>
                            Object.values(row).map(value => ({
                                value: value || ''
                            }))
                        );
                        return acc;
                    }, {} as SheetData);

                    setData(transformedData);
                    setSheets(Object.keys(transformedData));
                    setCurrentSheet(Object.keys(transformedData)[0]);
                    console.log("Successfully loaded data from Firestore");
                })
                .catch((error) => {
                    console.error("Error loading data from Firestore:", error);
                    setData({});
                    setSheets([]);
                    setCurrentSheet('');
                });
        }
    }, []);


    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-[32px] font-bold text-gray-800 mb-6">{t('upload_file')}</h1>
            {data[currentSheet] && data[currentSheet].length > 0 && !isOpen && (
                <>
                    <div className="mb-8">
                        <p className="text-gray-500 mb-4">{t('already_uploaded_1')} {fileName} {t('already_uploaded_2')}</p>

                        <button
                            onClick={() => setIsOpen(true)}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
                            {t('view_uploaded_file')} {fileName}
                        </button>
                    </div>
                </>
            )}
            <div className="border-2 border-dashed border-blue-200 rounded-lg p-8 bg-blue-50 flex flex-col items-center justify-center">
                <p className="text-gray-600 mb-4">{t('upload_file_desc')}</p>
                <label className="cursor-pointer">
                    <input
                        type="file"
                        onChange={handleFileUpload}
                        accept=".xlsx,.xls,.csv"
                        className="hidden"
                    />
                    <span className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                        {t('select_file')}
                    </span>
                </label>
            </div>

            {isLoading && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-40 w-40 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            )}

            {isOpen && (
                <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white w-[95vw] h-[90vh] p-4 rounded-lg shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-4">
                                <h2 className="text-xl font-bold"> {t('spread_sheet_view')}</h2>
                                <select
                                    value={currentSheet}
                                    onChange={(e) => setCurrentSheet(e.target.value)}
                                    className="px-3 py-1 border rounded-md"
                                >
                                    {sheets.map((sheet) => (
                                        <option key={sheet} value={sheet}>
                                            {sheet}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded"
                            >
                                ✕
                            </button>
                        </div>
                        {/* data preview */}
                        <div className="h-[calc(90vh-6rem)] overflow-auto">
                            <Spreadsheet
                                data={data[currentSheet] || []}
                                darkMode={false}
                            />
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
}

export default FileInput;