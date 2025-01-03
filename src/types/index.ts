export interface ExcelJSON {
    [key: string]: {
        [key: string]: any;
    }[];
}
export interface FirestoreExcelData {

    fileName: string;

    sheetName: string;

    data: { [key: string]: { [key: string]: any }[] };

    uploadedAt: Date;

}
