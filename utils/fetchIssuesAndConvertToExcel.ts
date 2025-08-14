
import * as XLSX from 'xlsx';

// Define the interface for an Issue based on the new structure you provided.
interface Issue {
  _id: string;
  implicatedPersonel: {
    firstName: string;
    lastName: string;
    companyLocation: string;
    rolePosition: string;
    phoneNumber: string;
  };
  malpractice: {
    type: string;
    location: string;
    description: string;
    isOngoing: string;
  };
  reporter: string;
  status: string;
  source: string;
  filename: string;
  createdAt: string;
  updatedAt: string;
}

// Define the interface for the entire API response object
interface ApiResponse {
  issues: Issue[];
  // Add other properties if the API returns them, like 'success', 'message', etc.
}

/**
 * Fetches all issues from a custom API endpoint using the fetch API and saves them to an Excel file.
 *
 * @param outputFilename The name of the Excel file to create (e.g., 'issues.xlsx').
 */
export async function fetchIssuesAndExportToExcel(outputFilename: string): Promise<void> {
  const api_url = '/api/admin/issues/list';

  console.log(`Fetching issues from ${api_url}...`);
  
  try {
    const response = await fetch(api_url);


    if (!response.ok) {
      console.error(`Error fetching issues: ${response.status} - ${response.statusText}`);
      return;
    }

    const apiResponse: ApiResponse = await response.json();

    const issuesData = apiResponse.issues; // Correctly access the array from the 'data' property

    // Mock Data
    // const mockIssues: Issue[] = [
    //   {
    //     _id: "65f3f01c8a1e67c8d9e2b10a",
    //     implicatedPersonel: {
    //       firstName: "John",
    //       lastName: "Doe",
    //       companyLocation: "Nairobi",
    //       rolePosition: "Manager",
    //       phoneNumber: "0712345678",
    //     },
    //     malpractice: {
    //       type: "Fraud",
    //       location: "Nairobi",
    //       description: "Financial fraud case.",
    //       isOngoing: "Yes",
    //     },
    //     reporter: "admin",
    //     status: "pending",
    //     source: "whistleblower",
    //     filename: "report1.pdf",
    //     createdAt: "2024-03-14T10:00:00Z",
    //     updatedAt: "2024-03-14T10:00:00Z",
    //     __v: 0,
    //   },
    //   {
    //     _id: "65f3f01c8a1e67c8d9e2b10b",
    //     implicatedPersonel: {
    //       firstName: "Jane",
    //       lastName: "Smith",
    //       companyLocation: "Mombasa",
    //       rolePosition: "Clerk",
    //       phoneNumber: "0723456789",
    //     },
    //     malpractice: {
    //       type: "Theft",
    //       location: "Mombasa",
    //       description: "Office supplies theft.",
    //       isOngoing: "No",
    //     },
    //     reporter: "admin",
    //     status: "resolved",
    //     source: "whistleblower",
    //     filename: "report2.pdf",
    //     createdAt: "2024-03-13T12:00:00Z",
    //     updatedAt: "2024-03-13T12:00:00Z",
    //     __v: 0,
    //   },
    //   {
    //     _id: "65f3f01c8a1e67c8d9e2b10c",
    //     implicatedPersonel: {
    //       firstName: "Peter",
    //       lastName: "Jones",
    //       companyLocation: "Kisumu",
    //       rolePosition: "Supervisor",
    //       phoneNumber: "0734567890",
    //     },
    //     malpractice: {
    //       type: "Corruption",
    //       location: "Kisumu",
    //       description: "Bribery and corruption.",
    //       isOngoing: "Yes",
    //     },
    //     reporter: "admin",
    //     status: "pending",
    //     source: "whistleblower",
    //     filename: "report3.pdf",
    //     createdAt: "2024-03-12T08:00:00Z",
    //     updatedAt: "2024-03-12T08:00:00Z",
    //     __v: 0,
    //   },
    //   {
    //     _id: "65f3f01c8a1e67c8d9e2b10d",
    //     implicatedPersonel: {
    //       firstName: "Alice",
    //       lastName: "Williams",
    //       companyLocation: "Nairobi",
    //       rolePosition: "Analyst",
    //       phoneNumber: "0745678901",
    //     },
    //     malpractice: {
    //       type: "Misconduct",
    //       location: "Nairobi",
    //       description: "Workplace harassment.",
    //       isOngoing: "No",
    //     },
    //     reporter: "admin",
    //     status: "closed",
    //     source: "whistleblower",
    //     filename: "report4.pdf",
    //     createdAt: "2024-03-11T14:00:00Z",
    //     updatedAt: "2024-03-11T14:00:00Z",
    //     __v: 0,
    //   },
    //   {
    //     _id: "65f3f01c8a1e67c8d9e2b10e",
    //     implicatedPersonel: {
    //       firstName: "Bob",
    //       lastName: "Brown",
    //       companyLocation: "Mombasa",
    //       rolePosition: "Driver",
    //       phoneNumber: "0756789012",
    //     },
    //     malpractice: {
    //       type: "Theft",
    //       location: "Mombasa",
    //       description: "Vehicle fuel theft.",
    //       isOngoing: "No",
    //     },
    //     reporter: "admin",
    //     status: "resolved",
    //     source: "whistleblower",
    //     filename: "report5.pdf",
    //     createdAt: "2024-03-10T09:00:00Z",
    //     updatedAt: "2024-03-10T09:00:00Z",
    //     __v: 0,
    //   },
    //   {
    //     _id: "65f3f01c8a1e67c8d9e2b10f",
    //     implicatedPersonel: {
    //       firstName: "Charlie",
    //       lastName: "Davis",
    //       companyLocation: "Kisumu",
    //       rolePosition: "Guard",
    //       phoneNumber: "0767890123",
    //     },
    //     malpractice: {
    //       type: "Misconduct",
    //       location: "Kisumu",
    //       description: "Negligence on duty.",
    //       isOngoing: "Yes",
    //     },
    //     reporter: "admin",
    //     status: "pending",
    //     source: "whistleblower",
    //     filename: "report6.pdf",
    //     createdAt: "2024-03-09T16:00:00Z",
    //     updatedAt: "2024-03-09T16:00:00Z",
    //     __v: 0,
    //   },
    //   {
    //     _id: "65f3f01c8a1e67c8d9e2b110",
    //     implicatedPersonel: {
    //       firstName: "Diana",
    //       lastName: "Evans",
    //       companyLocation: "Nairobi",
    //       rolePosition: "IT Technician",
    //       phoneNumber: "0778901234",
    //     },
    //     malpractice: {
    //       type: "Data Breach",
    //       location: "Nairobi",
    //       description: "Unauthorized data access.",
    //       isOngoing: "Yes",
    //     },
    //     reporter: "admin",
    //     status: "pending",
    //     source: "whistleblower",
    //     filename: "report7.pdf",
    //     createdAt: "2024-03-08T11:00:00Z",
    //     updatedAt: "2024-03-08T11:00:00Z",
    //     __v: 0,
    //   },
    //   {
    //     _id: "65f3f01c8a1e67c8d9e2b111",
    //     implicatedPersonel: {
    //       firstName: "Frank",
    //       lastName: "Garcia",
    //       companyLocation: "Mombasa",
    //       rolePosition: "Engineer",
    //       phoneNumber: "0789012345",
    //     },
    //     malpractice: {
    //       type: "Fraud",
    //       location: "Mombasa",
    //       description: "Falsified project reports.",
    //       isOngoing: "No",
    //     },
    //     reporter: "admin",
    //     status: "resolved",
    //     source: "whistleblower",
    //     filename: "report8.pdf",
    //     createdAt: "2024-03-07T13:00:00Z",
    //     updatedAt: "2024-03-07T13:00:00Z",
    //     __v: 0,
    //   },
    //   {
    //     _id: "65f3f01c8a1e67c8d9e2b112",
    //     implicatedPersonel: {
    //       firstName: "Grace",
    //       lastName: "Harris",
    //       companyLocation: "Kisumu",
    //       rolePosition: "Sales Rep",
    //       phoneNumber: "0790123456",
    //     },
    //     malpractice: {
    //       type: "Theft",
    //       location: "Kisumu",
    //       description: "Misappropriation of company funds.",
    //       isOngoing: "No",
    //     },
    //     reporter: "admin",
    //     status: "closed",
    //     source: "whistleblower",
    //     filename: "report9.pdf",
    //     createdAt: "2024-03-06T15:00:00Z",
    //     updatedAt: "2024-03-06T15:00:00Z",
    //     __v: 0,
    //   },
    //   {
    //     _id: "65f3f01c8a1e67c8d9e2b113",
    //     implicatedPersonel: {
    //       firstName: "Henry",
    //       lastName: "Ismail",
    //       companyLocation: "Nairobi",
    //       rolePosition: "Accountant",
    //       phoneNumber: "0701234567",
    //     },
    //     malpractice: {
    //       type: "Fraud",
    //       location: "Nairobi",
    //       description: "Invoice manipulation.",
    //       isOngoing: "Yes",
    //     },
    //     reporter: "admin",
    //     status: "pending",
    //     source: "whistleblower",
    //     filename: "report10.pdf",
    //     createdAt: "2024-03-05T17:00:00Z",
    //     updatedAt: "2024-03-05T17:00:00Z",
    //     __v: 0,
    //   },
    //   {
    //     _id: "65f3f01c8a1e67c8d9e2b114",
    //     implicatedPersonel: {
    //       firstName: "Irene",
    //       lastName: "Jackson",
    //       companyLocation: "Mombasa",
    //       rolePosition: "HR Manager",
    //       phoneNumber: "0712345678",
    //     },
    //     malpractice: {
    //       type: "Misconduct",
    //       location: "Mombasa",
    //       description: "Violation of company policy.",
    //       isOngoing: "No",
    //     },
    //     reporter: "admin",
    //     status: "resolved",
    //     source: "whistleblower",
    //     filename: "report11.pdf",
    //     createdAt: "2024-03-04T10:00:00Z",
    //     updatedAt: "2024-03-04T10:00:00Z",
    //     __v: 0,
    //   },
    //   {
    //     _id: "65f3f01c8a1e67c8d9e2b115",
    //     implicatedPersonel: {
    //       firstName: "Jack",
    //       lastName: "King",
    //       companyLocation: "Kisumu",
    //       rolePosition: "Engineer",
    //       phoneNumber: "0723456789",
    //     },
    //     malpractice: {
    //       type: "Theft",
    //       location: "Kisumu",
    //       description: "Equipment theft.",
    //       isOngoing: "Yes",
    //     },
    //     reporter: "admin",
    //     status: "pending",
    //     source: "whistleblower",
    //     filename: "report12.pdf",
    //     createdAt: "2024-03-03T12:00:00Z",
    //     updatedAt: "2024-03-03T12:00:00Z",
    //     __v: 0,
    //   },
    // ];
    // Added a check to ensure issuesData is an array before proceeding
    if (!issuesData || !Array.isArray(issuesData)) {
      console.error('API response is missing the expected array of issues.');
      return;
    }

    console.log(`Found ${issuesData.length} issues. Writing to Excel file...`);

    // Prepare the data for the Excel workbook with new headers
    const worksheetData = [
      [
        'Report ID',
        'Reporter ID',
        'Status',
        'Source',
        'Filename',
        'Created At',
        'Updated At',
        'First Name',
        'Last Name',
        'Company Location',
        'Role Position',
        'Phone Number',
        'Malpractice Type',
        'Malpractice Location',
        'Description',
        'Is Ongoing'
      ],
      ...issuesData.map(issue => [
        issue._id,
        issue.reporter,
        issue.status,
        issue.source,
        issue.filename,
        new Date(issue.createdAt).toLocaleString(),
        new Date(issue.updatedAt).toLocaleString(),
        issue.implicatedPersonel.firstName,
        issue.implicatedPersonel.lastName,
        issue.implicatedPersonel.companyLocation,
        issue.implicatedPersonel.rolePosition,
        issue.implicatedPersonel.phoneNumber,
        issue.malpractice.type,
        issue.malpractice.location,
        issue.malpractice.description,
        issue.malpractice.isOngoing,
      ]),
    ];

    // Create a new Excel workbook and add a worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Issues');

    // Write the workbook to a file
    XLSX.writeFile(workbook, outputFilename);
    console.log(`Successfully exported issues to '${outputFilename}'`);
  } catch (error) {
    console.error('An unexpected network error occurred:', error);
  }
}
