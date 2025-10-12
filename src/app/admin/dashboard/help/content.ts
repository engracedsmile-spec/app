
export type HelpArticle = {
  slug: string;
  title: string;
  description: string;
  content: string;
  relatedArticles?: {
    slug: string;
    title: string;
    category: string;
  }[];
};

export type HelpCategory = {
  slug: string;
  title: string;
  articles: HelpArticle[];
};

export const helpContent: HelpCategory[] = [
  {
    slug: 'dashboard',
    title: 'Dashboard',
    articles: [
      {
        slug: 'overview',
        title: 'Dashboard Overview',
        description: 'Understand the main dashboard views: Operations, Financials, and Analytics.',
        content: `The main dashboard provides a high-level overview of your business operations. It's divided into three main screens that you can cycle through using the controls at the top.

### Operations View
This is your daily command center. It shows:
*   **Today's Trips:** Total number of bookings created today.
*   **In Progress:** Active trips currently on the road.
*   **Completed Today:** Trips that have been successfully completed today.
*   **Recent Trips List:** A real-time list of the latest bookings as they happen.

### Financials View
This view displays important financial data, including:
*   **Total Revenue:** Gross income from completed trips.
*   **Total Expenses:** All approved payouts and expenses.
*   **Pending Expenses:** Withdrawal requests from drivers that require your attention.

### Analytics View
The analytics view provides visual insights into your platform's performance. It includes charts for booking status breakdowns and leaderboards for top-performing drivers and popular routes.
`,
        relatedArticles: [
            { slug: 'analytics-overview', title: 'Deep Dive into Analytics', category: 'analytics' },
        ]
      }
    ]
  },
  {
    slug: 'bookings',
    title: 'Bookings & Trips',
    articles: [
      {
        slug: 'manage-trips',
        title: 'Managing All Trips',
        description: 'Learn how to filter, search, and manage all passenger and charter bookings.',
        content: `The "Trip Management" page (accessible via the "Trips" icon in the bottom navigation) is where you can see every booking made on the platform.

### Filtering and Searching
Use the tools at the top of the page to find specific trips:
*   **Tabs:** Filter bookings by type: **All Trips**, **Passenger Trips**, or **Charters**.
*   **Search Bar:** Find bookings by Passenger Name, Booking ID, Driver Name, or parts of an address.
*   **Date Range:** Filter by a specific date range.
*   **Status Filter:** Show only trips with a specific status (e.g., Pending, Completed).

### Viewing Trip Details
Clicking on a trip in the table or using the "View Details" action will take you to a detailed summary of that booking, including passenger details, route, and status history.
`,
        relatedArticles: [
            { slug: 'schedule-departures', title: 'Scheduling Departures', category: 'bookings' },
        ]
      },
      {
        slug: 'schedule-departures',
        title: 'Scheduling Departures',
        description: 'How to create and manage scheduled passenger trips for specific routes.',
        content: `A "Departure" is a specific vehicle leaving on a specific route at a set time. This is the foundation of your passenger booking service.

### Creating a New Departure
1.  Navigate to the **Departures** page (More -> Departures).
2.  Click the **"Schedule Departure"** button to open the form.
3.  Select a pre-defined **Route**. Routes are created in **Settings -> Routes**.
4.  Choose a **Departure Date** and **Departure Period** (Morning or Evening).
5.  Choose an **Available Vehicle**. The system intelligently filters this list, hiding vehicles that are already scheduled for another trip on the selected date to prevent double-booking.
6.  **Assign a Driver**. If the selected vehicle has a primary driver, they will be automatically selected for you.
7.  You can set a **Custom Fare** for this specific trip, or leave it blank to use the route's default base fare.

### Smart Reverse Trip Creation
When creating a departure, you can enable the **"Create Reverse Trip"** switch.
*   This powerful feature automatically schedules the return trip for you.
*   The system is smart: if your main trip is in the **Morning**, the reverse trip will be scheduled for the **Evening** of the same day, and vice-versa.
*   This saves time and helps you manage vehicle rotations effectively.

### Managing Departures
Once created, the departure appears in the list. You can click on it to view the **Passenger Manifest**, where you can check passengers in and update the trip status (e.g., from "Boarding" to "In Transit").
`,
         relatedArticles: [
            { slug: 'manage-routes', title: 'Creating Service Routes', category: 'settings' },
            { slug: 'manage-vehicles', title: 'Managing Your Fleet', category: 'settings' },
        ]
      },
       {
        slug: 'manage-charters',
        title: 'Managing Charter Bookings',
        description: 'Understand the flow and fulfillment of private vehicle hires.',
        content: `Charter bookings are for users who want to hire an entire vehicle.

### Charter Booking Flow
1.  A user selects a **Charter Package** you have created (e.g., "Executive Class").
2.  They provide their contact details, start date, and the duration of the hire.
3.  They confirm the booking and make a payment.

### Fulfillment
*   Unlike passenger trips, charter bookings initially appear as "Pending" in the main **Trip Management** list.
*   You must manually assign a specific **Vehicle** and **Driver** to the charter trip by editing its details.
*   Once a vehicle and driver are assigned, you can update the status to "Confirmed".
*   The system prevents double-booking by checking vehicle availability during the charter period.
`,
        relatedArticles: [
            { slug: 'charter-packages', title: 'Configuring Charter Packages', category: 'settings' },
        ]
      },
    ]
  },
  {
    slug: 'users',
    title: 'User Management',
    articles: [
      {
        slug: 'manage-users',
        title: 'Managing All Users',
        description: 'How to add, edit, suspend, and view details for all users.',
        content: `The "User Management" page (accessible via the "Users" icon) is your central hub for all registered users.

### Adding a New User
Click the "Add User" button to open a form where you can manually create a new user account. You must provide their name, email, phone, a temporary password, and assign them a role (Customer, Driver, or Admin).

### Editing and Viewing Details
*   Use the action menu (three dots) on any user row to **"View Details"**.
*   The detail page shows their profile information, wallet balance, and a complete history of their trips.
*   From the detail page, you can click **"Edit User"** to update their name, contact info, role, or status.

### Suspending a User
To temporarily disable a user's account without deleting it, select "Suspend" from the action menu. Their status will change to "Suspended", and they will not be able to log in. You can re-activate them from the same menu.
`
      },
      {
        slug: 'manage-drivers',
        title: 'Managing Drivers & Applications',
        description: 'How to approve new driver applications and manage your driver workforce.',
        content: `The "Driver Management" page (More -> Driver Management) is split into two tabs.

### All Drivers
This tab lists all of your approved drivers. You can see their basic information and status. Clicking "View Details" will take you to their full profile, where you can see their trip history and earnings.

### Applications
This tab shows a list of all pending applications from prospective drivers who have filled out the driver sign-up form.
*   **Review:** Check the applicant's details.
*   **Approve:** If you approve the application, their status changes. You must then go to the main "User Management" page and click **"Add User"** to create their official account, making sure to assign them the "Driver" role.
*   **Reject:** This will mark the application as rejected.
`,
        relatedArticles: [
            { slug: 'manage-users', title: 'Managing All Users', category: 'users' },
        ]
      },
       {
        slug: 'manage-team',
        title: 'Managing Your Admin Team',
        description: 'Assign roles and permissions to your administrative staff.',
        content: `Admin team management is handled within the main **User Management** page.

### Assigning Roles
When you add or edit a user, you can set their "Role".
*   Selecting an admin role (Manager, Support, Finance, Marketing) automatically sets their "User Type" to "admin".
*   Each role has a specific set of permissions that determines what they can see and do in the dashboard.

### Permission Levels
*   **Manager:** Has full access to all settings and features.
*   **Support:** Can manage users, trips, and support tickets, but cannot access financial settings.
*   **Finance:** Can view financial reports and manage payouts, but cannot change operational settings.
*   **Marketing:** Can manage promotions and send notifications, but cannot see sensitive financial or user data.
`,
      },
    ]
  },
  {
    slug: 'financials',
    title: 'Financials & Payouts',
    articles: [
        {
            slug: 'payouts',
            title: 'Processing Driver Payouts',
            description: 'How to review and approve withdrawal requests from drivers.',
            content: `The "Payouts & Requests" page (More -> Payouts) is where you handle all financial disbursements to your drivers.

### Pending Requests
The "Pending" tab lists all active withdrawal requests from drivers. Each card shows the requested amount and the driver's name.
*   **Approve:** Clicking "Approve" will deduct the amount from the driver's in-app wallet balance and mark the request as complete. This action is final.
*   **Reject:** Clicking "Reject" will deny the request without any funds being moved.

### History
The "History" tab shows a complete log of all past withdrawal requests, both approved and rejected, providing a clear audit trail.
`
        },
        {
            slug: 'reports',
            title: 'Generating Financial Reports',
            description: 'Export data on transactions, shipments, and users for bookkeeping.',
            content: `The "Report" page (More -> Report) allows you to export your data for analysis or accounting.

1.  **Select Report Type**: Choose the data you want to export (e.g., Shipments, New Users, Transactions).
2.  **Select Date Range**: Use the date picker to define the period for your report.
3.  **Generate**: Click "Generate Report". The data will appear in a table below.
4.  **Export**: Click "Export CSV" to download the generated data as a CSV file, which can be opened in spreadsheet software.
`
        },
    ]
  },
  {
    slug: 'settings',
    title: 'Configuration & Settings',
    articles: [
        {
            slug: 'general-settings',
            title: 'General App Settings',
            description: 'Configure your app name, support contacts, and base currency.',
            content: `This page (More -> General) contains the core configuration for your application.

*   **App Name**: The name that appears throughout the application and to your users.
*   **Support Contact**: The email and phone number provided to users when they need help.
*   **Currency**: The three-letter currency code (e.g., NGN) used for all financial values in the app.
`
        },
         {
            slug: 'manage-routes',
            title: 'Creating Service Routes',
            description: 'Define the travel corridors and base prices for passenger trips.',
            content: `This page (More -> Routes) is where you define the routes your service operates on. A route is a connection between two terminals.

### Creating a Route
1.  Click **"Create New Route"**.
2.  Give the route a **descriptive name** (e.g., "Jibowu -> Utako (Day)").
3.  Select an **Origin Terminal** and a **Destination Terminal**. Terminals must be created first.
4.  Set a **Base Fare** for a single seat on this route.
5.  You can optionally link it to a **Reverse Route** to enable smart return-trip scheduling.

Once a route is created, you can schedule departures on it from the **Departures** page.
`,
             relatedArticles: [
                { slug: 'manage-terminals', title: 'Managing Terminals', category: 'settings' },
                { slug: 'schedule-departures', title: 'Scheduling Departures', category: 'bookings' },
            ]
        },
        {
            slug: 'manage-terminals',
            title: 'Managing Terminals',
            description: 'Add or edit your physical locations, such as bus stops and offices.',
            content: `Terminals are your physical operational locations. You must create terminals before you can create routes between them.

### Creating a Terminal
1.  Navigate to the **Terminals** page (More -> Terminals).
2.  Click **"New Terminal"**.
3.  Fill in the details:
    *   **Terminal Name**: The public name of the location (e.g., "Utako Park, Abuja").
    *   **State & City**: The location of the terminal.
    *   **Full Address**: The specific street address.
4.  Set the status to **"Active"** to make it available for route creation.
`
        },
        {
            slug: 'manage-vehicles',
            title: 'Managing Your Fleet',
            description: 'Add and assign vehicles to your drivers.',
            content: `This page (More -> Vehicles) is where you manage your fleet.

### Adding a Vehicle
1.  Click **"Add Vehicle"**.
2.  Fill in the vehicle's details, such as make, model, year, and license plate.
3.  You can optionally assign a **Primary Driver** to the vehicle. This driver will be pre-selected when you create a departure using this vehicle.
`
        },
        {
            slug: 'charter-packages',
            title: 'Configuring Charter Packages',
            description: 'Create and manage the service tiers for vehicle charters.',
            content: `Charter Packages are templates for your private hire service.

### Creating a Package
1.  Navigate to the **Charter Packages** page (More -> Charter Packages).
2.  Click **"New Package"**.
3.  Define the package:
    *   **Name & Description**: e.g., "Gold Class" - includes A/C, refreshments.
    *   **Base Price**: The starting price for the hire.
    *   **Daily Rate**: The additional cost for each extra day of hire.
    *   **Features**: Toggle optional add-ons like "Security Escort" or "Refreshments".
            
These packages will be presented to users when they choose to charter a vehicle.
`
        },
    ]
  }
];
