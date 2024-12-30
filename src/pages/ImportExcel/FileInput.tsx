import React from 'react';
import * as XLSX from 'xlsx';
import Spreadsheet from "react-spreadsheet";
import { useTranslation } from 'react-i18next';
type Cell = {
    value: any;
};

function FileInput() {
    const [data, setData] = React.useState<Cell[][]>([]);
    const [isOpen, setIsOpen] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [sheets, setSheets] = React.useState<string[]>([]);
    const [currentSheet, setCurrentSheet] = React.useState<string>('');
    const [workbook, setWorkbook] = React.useState<XLSX.WorkBook | null>(null);
    const [fileName, setFileName] = React.useState<string>('');
    const { t, i18n } = useTranslation();

    React.useEffect(() => {
        // Debug translation
        console.log('Current language:', i18n.language);
        console.log('Translation test:', t('upload_file'));
    }, []);


    const loadSheet = (workbook: XLSX.WorkBook, sheetName: string) => {
        const sheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

        const formattedData = rawData.map((row) =>
            row.map((cell) => ({
                value: cell ?? null
            }))
        );

        setData(formattedData);
        setCurrentSheet(sheetName);
    };


    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        const reader = new FileReader();

        reader.onload = (event) => {
            if (!event.target) return;
            const wb = XLSX.read(event.target.result, { type: 'binary' });
            setWorkbook(wb); // Store workbook in state
            const sheetNames = wb.SheetNames;
            setSheets(sheetNames);

            loadSheet(wb, sheetNames[0]);
            setIsOpen(true);
            setIsLoading(false);
            setFileName(file.name);
        };

        reader.readAsBinaryString(file);
    };


    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-[32px] font-bold text-gray-800 mb-6">{t('upload_file')}</h1>
            {data.length > 0 && !isOpen && (
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
                                    onChange={(e) => workbook && loadSheet(workbook, e.target.value)}
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
                        <div className="h-[calc(90vh-6rem)] overflow-auto">
                            <Spreadsheet
                                data={data}
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