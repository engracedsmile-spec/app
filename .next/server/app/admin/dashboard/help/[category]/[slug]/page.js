(()=>{var e={};e.id=4403,e.ids=[4403],e.modules={47849:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external")},72934:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external.js")},55403:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external")},54580:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external.js")},94749:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external")},45869:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},83122:e=>{"use strict";e.exports=require("undici")},6113:e=>{"use strict";e.exports=require("crypto")},9523:e=>{"use strict";e.exports=require("dns")},82361:e=>{"use strict";e.exports=require("events")},57147:e=>{"use strict";e.exports=require("fs")},13685:e=>{"use strict";e.exports=require("http")},85158:e=>{"use strict";e.exports=require("http2")},41808:e=>{"use strict";e.exports=require("net")},49411:e=>{"use strict";e.exports=require("node:path")},97742:e=>{"use strict";e.exports=require("node:process")},41041:e=>{"use strict";e.exports=require("node:url")},22037:e=>{"use strict";e.exports=require("os")},71017:e=>{"use strict";e.exports=require("path")},77282:e=>{"use strict";e.exports=require("process")},12781:e=>{"use strict";e.exports=require("stream")},24404:e=>{"use strict";e.exports=require("tls")},57310:e=>{"use strict";e.exports=require("url")},73837:e=>{"use strict";e.exports=require("util")},59796:e=>{"use strict";e.exports=require("zlib")},56999:(e,t,r)=>{"use strict";r.r(t),r.d(t,{GlobalError:()=>n.a,__next_app__:()=>p,originalPathname:()=>u,pages:()=>d,routeModule:()=>h,tree:()=>c}),r(4551),r(11170),r(86120),r(73766),r(35866);var a=r(23191),i=r(88716),s=r(37922),n=r.n(s),o=r(95231),l={};for(let e in o)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(l[e]=()=>o[e]);r.d(t,l);let c=["",{children:["admin",{children:["dashboard",{children:["help",{children:["[category]",{children:["[slug]",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(r.bind(r,4551)),"/root/app/src/app/admin/dashboard/help/[category]/[slug]/page.tsx"]}]},{}]},{}]},{layout:[()=>Promise.resolve().then(r.bind(r,11170)),"/root/app/src/app/admin/dashboard/help/layout.tsx"]}]},{layout:[()=>Promise.resolve().then(r.bind(r,86120)),"/root/app/src/app/admin/dashboard/layout.tsx"]}]},{metadata:{icon:[async e=>(await Promise.resolve().then(r.bind(r,73881))).default(e)],apple:[],openGraph:[],twitter:[],manifest:void 0}}]},{layout:[()=>Promise.resolve().then(r.bind(r,73766)),"/root/app/src/app/layout.tsx"],"not-found":[()=>Promise.resolve().then(r.t.bind(r,35866,23)),"next/dist/client/components/not-found-error"],metadata:{icon:[async e=>(await Promise.resolve().then(r.bind(r,73881))).default(e)],apple:[],openGraph:[],twitter:[],manifest:void 0}}],d=["/root/app/src/app/admin/dashboard/help/[category]/[slug]/page.tsx"],u="/admin/dashboard/help/[category]/[slug]/page",p={require:r,loadChunk:()=>Promise.resolve()},h=new a.AppPageRouteModule({definition:{kind:i.x.APP_PAGE,page:"/admin/dashboard/help/[category]/[slug]/page",pathname:"/admin/dashboard/help/[category]/[slug]",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:c}})},54639:(e,t,r)=>{Promise.resolve().then(r.bind(r,5153))},44436:(e,t,r)=>{Promise.resolve().then(r.bind(r,83905))},6764:(e,t,r)=>{Promise.resolve().then(r.bind(r,94923))},86333:(e,t,r)=>{"use strict";r.d(t,{Z:()=>a});/**
 * @license lucide-react v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=(0,r(62881).Z)("ArrowLeft",[["path",{d:"m12 19-7-7 7-7",key:"1l729n"}],["path",{d:"M19 12H5",key:"x3x0zl"}]])},5153:(e,t,r)=>{"use strict";r.d(t,{HelpArticleClientPage:()=>c});var a=r(10326),i=r(1656),s=r(29752),n=r(90434),o=r(24230),l=r(48193);/**
 * @project Engraced Smiles
 * @author Daniel Innocent <@mdtbmw>
 * @copyright Copyright (c) 2024. All rights reserved.
 * This software is the exclusive property of Daniel Innocent.
 * A license has been granted to Mr. Ismail Muhammed for resale to Engraced Smiles.
 */let c=({article:e})=>(0,a.jsxs)(a.Fragment,{children:[a.jsx(i.b,{title:e.title}),(0,a.jsxs)("main",{className:"p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto",children:[a.jsx("div",{className:"lg:col-span-2",children:a.jsx(s.Zb,{children:a.jsx(s.aY,{className:"p-6",children:a.jsx("div",{className:"prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert max-w-none",children:a.jsx(l.UG,{children:e.content})})})})}),a.jsx("div",{className:"lg:col-span-1",children:(0,a.jsxs)(s.Zb,{className:"sticky top-20",children:[a.jsx(s.Ol,{children:a.jsx(s.ll,{children:"Related Articles"})}),a.jsx(s.aY,{className:"space-y-3",children:e.relatedArticles&&e.relatedArticles.length>0?e.relatedArticles.map(e=>a.jsx(n.default,{href:`/admin/dashboard/help/${e.category}/${e.slug}`,children:(0,a.jsxs)("div",{className:"flex items-center justify-between p-3 rounded-lg hover:bg-muted",children:[a.jsx("span",{className:"font-medium",children:e.title}),a.jsx(o.Z,{className:"h-4 w-4 text-muted-foreground"})]})},e.slug)):a.jsx("p",{className:"text-sm text-muted-foreground",children:"No related articles."})})]})})]})]})},83905:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>s});var a=r(10326),i=r(3236);/**
 * @project Engraced Smiles
 * @author Daniel Innocent <@mdtbmw>
 * @copyright Copyright (c) 2024. All rights reserved.
 * This software is the exclusive property of Daniel Innocent.
 * A license has been granted to Mr. Ismail Muhammed for resale to Engraced Smiles.
 */function s({children:e}){return a.jsx("div",{className:"flex flex-col h-full",children:a.jsx(i.x,{className:"flex-1",children:e})})}},94923:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>l});var a=r(10326),i=r(49260),s=r(35047);r(17577);var n=r(15971),o=r(87321);/**
 * @project Engraced Smiles
 * @author Daniel Innocent <@mdtbmw>
 * @copyright Copyright (c) 2024. All rights reserved.
 * This software is the exclusive property of Daniel Innocent.
 * A license has been granted to Mr. Ismail Muhammed for resale to Engraced Smiles.
 */function l({children:e}){let{user:t,loading:r}=(0,i.a)();return((0,s.useRouter)(),r||!t||"admin"!==t.userType)?a.jsx(n.Preloader,{}):(0,a.jsxs)("div",{className:"flex flex-col h-dvh",children:[a.jsx("main",{className:"flex-1 overflow-y-auto pb-24",children:e}),a.jsx(o.h,{})]})}},1656:(e,t,r)=>{"use strict";r.d(t,{b:()=>l});var a=r(10326),i=r(91664),s=r(86333),n=r(35047),o=r(51223);/**
 * @project Engraced Smiles
 * @author Daniel Innocent <@mdtbmw>
 * @copyright Copyright (c) 2024. All rights reserved.
 * This software is the exclusive property of Daniel Innocent.
 * A license has been granted to Mr. Ismail Muhammed for resale to Engraced Smiles.
 *
 * So, you're looking at my code, huh? That's cool. Just don't copy it without asking.
 * I poured my heart, soul, and a questionable amount of caffeine into this.
 * Find me on socials @mdtbmw if you want to geek out over code.
 */let l=({title:e,children:t,className:r})=>{let l=(0,n.useRouter)();return(0,a.jsxs)("header",{className:(0,o.cn)("flex items-center justify-between p-4 sticky top-0 bg-background z-10 border-b",r),children:[(0,a.jsxs)("div",{className:"flex items-center gap-2 min-w-0 flex-1",children:[a.jsx(i.z,{variant:"ghost",size:"icon",onClick:()=>l.back(),className:"mr-2 flex-shrink-0",children:a.jsx(s.Z,{className:"h-5 w-5"})}),a.jsx("h1",{className:"text-lg md:text-xl font-bold text-left truncate min-w-0",children:e})]}),t&&a.jsx("div",{className:"flex-shrink-0 ml-2",children:t})]})}},91664:(e,t,r)=>{"use strict";r.d(t,{d:()=>l,z:()=>c});var a=r(10326),i=r(17577),s=r(99469),n=r(79360),o=r(51223);let l=(0,n.j)("inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",{variants:{variant:{default:"bg-primary text-primary-foreground hover:bg-primary/90",destructive:"bg-destructive text-destructive-foreground hover:bg-destructive/90",outline:"border border-input bg-background hover:bg-accent hover:text-accent-foreground",secondary:"bg-secondary text-secondary-foreground hover:bg-secondary/80",ghost:"hover:bg-accent hover:text-accent-foreground",link:"text-primary underline-offset-4 hover:underline"},size:{default:"h-10 px-4 py-2",sm:"h-9 rounded-md px-3",lg:"h-11 rounded-md px-8",icon:"h-10 w-10"}},defaultVariants:{variant:"default",size:"default"}}),c=i.forwardRef(({className:e,variant:t,size:r,asChild:i=!1,...n},c)=>{let d=i?s.g7:"button";return a.jsx(d,{className:(0,o.cn)(l({variant:t,size:r,className:e})),ref:c,...n})});c.displayName="Button"},61085:(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),function(e,t){for(var r in t)Object.defineProperty(e,r,{enumerable:!0,get:t[r]})}(t,{ReadonlyURLSearchParams:function(){return n},RedirectType:function(){return a.RedirectType},notFound:function(){return i.notFound},permanentRedirect:function(){return a.permanentRedirect},redirect:function(){return a.redirect}});let a=r(83953),i=r(16399);class s extends Error{constructor(){super("Method unavailable on `ReadonlyURLSearchParams`. Read more: https://nextjs.org/docs/app/api-reference/functions/use-search-params#updating-searchparams")}}class n extends URLSearchParams{append(){throw new s}delete(){throw new s}set(){throw new s}sort(){throw new s}}("function"==typeof t.default||"object"==typeof t.default&&null!==t.default)&&void 0===t.default.__esModule&&(Object.defineProperty(t.default,"__esModule",{value:!0}),Object.assign(t.default,t),e.exports=t.default)},16399:(e,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),function(e,t){for(var r in t)Object.defineProperty(e,r,{enumerable:!0,get:t[r]})}(t,{isNotFoundError:function(){return i},notFound:function(){return a}});let r="NEXT_NOT_FOUND";function a(){let e=Error(r);throw e.digest=r,e}function i(e){return"object"==typeof e&&null!==e&&"digest"in e&&e.digest===r}("function"==typeof t.default||"object"==typeof t.default&&null!==t.default)&&void 0===t.default.__esModule&&(Object.defineProperty(t.default,"__esModule",{value:!0}),Object.assign(t.default,t),e.exports=t.default)},8586:(e,t)=>{"use strict";var r;Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"RedirectStatusCode",{enumerable:!0,get:function(){return r}}),function(e){e[e.SeeOther=303]="SeeOther",e[e.TemporaryRedirect=307]="TemporaryRedirect",e[e.PermanentRedirect=308]="PermanentRedirect"}(r||(r={})),("function"==typeof t.default||"object"==typeof t.default&&null!==t.default)&&void 0===t.default.__esModule&&(Object.defineProperty(t.default,"__esModule",{value:!0}),Object.assign(t.default,t),e.exports=t.default)},83953:(e,t,r)=>{"use strict";var a;Object.defineProperty(t,"__esModule",{value:!0}),function(e,t){for(var r in t)Object.defineProperty(e,r,{enumerable:!0,get:t[r]})}(t,{RedirectType:function(){return a},getRedirectError:function(){return l},getRedirectStatusCodeFromError:function(){return g},getRedirectTypeFromError:function(){return h},getURLFromRedirectError:function(){return p},isRedirectError:function(){return u},permanentRedirect:function(){return d},redirect:function(){return c}});let i=r(54580),s=r(72934),n=r(8586),o="NEXT_REDIRECT";function l(e,t,r){void 0===r&&(r=n.RedirectStatusCode.TemporaryRedirect);let a=Error(o);a.digest=o+";"+t+";"+e+";"+r+";";let s=i.requestAsyncStorage.getStore();return s&&(a.mutableCookies=s.mutableCookies),a}function c(e,t){void 0===t&&(t="replace");let r=s.actionAsyncStorage.getStore();throw l(e,t,(null==r?void 0:r.isAction)?n.RedirectStatusCode.SeeOther:n.RedirectStatusCode.TemporaryRedirect)}function d(e,t){void 0===t&&(t="replace");let r=s.actionAsyncStorage.getStore();throw l(e,t,(null==r?void 0:r.isAction)?n.RedirectStatusCode.SeeOther:n.RedirectStatusCode.PermanentRedirect)}function u(e){if("object"!=typeof e||null===e||!("digest"in e)||"string"!=typeof e.digest)return!1;let[t,r,a,i]=e.digest.split(";",4),s=Number(i);return t===o&&("replace"===r||"push"===r)&&"string"==typeof a&&!isNaN(s)&&s in n.RedirectStatusCode}function p(e){return u(e)?e.digest.split(";",3)[2]:null}function h(e){if(!u(e))throw Error("Not a redirect error");return e.digest.split(";",2)[1]}function g(e){if(!u(e))throw Error("Not a redirect error");return Number(e.digest.split(";",4)[3])}(function(e){e.push="push",e.replace="replace"})(a||(a={})),("function"==typeof t.default||"object"==typeof t.default&&null!==t.default)&&void 0===t.default.__esModule&&(Object.defineProperty(t.default,"__esModule",{value:!0}),Object.assign(t.default,t),e.exports=t.default)},4551:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>u,generateStaticParams:()=>p});var a=r(19510),i=r(61085);let s=[{slug:"dashboard",title:"Dashboard",articles:[{slug:"overview",title:"Dashboard Overview",description:"Understand the main dashboard views: Operations, Financials, and Analytics.",content:`The main dashboard provides a high-level overview of your business operations. It's divided into three main screens that you can cycle through using the controls at the top.

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
`,relatedArticles:[{slug:"analytics-overview",title:"Deep Dive into Analytics",category:"analytics"}]}]},{slug:"bookings",title:"Bookings & Trips",articles:[{slug:"manage-trips",title:"Managing All Trips",description:"Learn how to filter, search, and manage all passenger and charter bookings.",content:`The "Trip Management" page (accessible via the "Trips" icon in the bottom navigation) is where you can see every booking made on the platform.

### Filtering and Searching
Use the tools at the top of the page to find specific trips:
*   **Tabs:** Filter bookings by type: **All Trips**, **Passenger Trips**, or **Charters**.
*   **Search Bar:** Find bookings by Passenger Name, Booking ID, Driver Name, or parts of an address.
*   **Date Range:** Filter by a specific date range.
*   **Status Filter:** Show only trips with a specific status (e.g., Pending, Completed).

### Viewing Trip Details
Clicking on a trip in the table or using the "View Details" action will take you to a detailed summary of that booking, including passenger details, route, and status history.
`,relatedArticles:[{slug:"schedule-departures",title:"Scheduling Departures",category:"bookings"}]},{slug:"schedule-departures",title:"Scheduling Departures",description:"How to create and manage scheduled passenger trips for specific routes.",content:`A "Departure" is a specific vehicle leaving on a specific route at a set time. This is the foundation of your passenger booking service.

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
`,relatedArticles:[{slug:"manage-routes",title:"Creating Service Routes",category:"settings"},{slug:"manage-vehicles",title:"Managing Your Fleet",category:"settings"}]},{slug:"manage-charters",title:"Managing Charter Bookings",description:"Understand the flow and fulfillment of private vehicle hires.",content:`Charter bookings are for users who want to hire an entire vehicle.

### Charter Booking Flow
1.  A user selects a **Charter Package** you have created (e.g., "Executive Class").
2.  They provide their contact details, start date, and the duration of the hire.
3.  They confirm the booking and make a payment.

### Fulfillment
*   Unlike passenger trips, charter bookings initially appear as "Pending" in the main **Trip Management** list.
*   You must manually assign a specific **Vehicle** and **Driver** to the charter trip by editing its details.
*   Once a vehicle and driver are assigned, you can update the status to "Confirmed".
*   The system prevents double-booking by checking vehicle availability during the charter period.
`,relatedArticles:[{slug:"charter-packages",title:"Configuring Charter Packages",category:"settings"}]}]},{slug:"users",title:"User Management",articles:[{slug:"manage-users",title:"Managing All Users",description:"How to add, edit, suspend, and view details for all users.",content:`The "User Management" page (accessible via the "Users" icon) is your central hub for all registered users.

### Adding a New User
Click the "Add User" button to open a form where you can manually create a new user account. You must provide their name, email, phone, a temporary password, and assign them a role (Customer, Driver, or Admin).

### Editing and Viewing Details
*   Use the action menu (three dots) on any user row to **"View Details"**.
*   The detail page shows their profile information, wallet balance, and a complete history of their trips.
*   From the detail page, you can click **"Edit User"** to update their name, contact info, role, or status.

### Suspending a User
To temporarily disable a user's account without deleting it, select "Suspend" from the action menu. Their status will change to "Suspended", and they will not be able to log in. You can re-activate them from the same menu.
`},{slug:"manage-drivers",title:"Managing Drivers & Applications",description:"How to approve new driver applications and manage your driver workforce.",content:`The "Driver Management" page (More -> Driver Management) is split into two tabs.

### All Drivers
This tab lists all of your approved drivers. You can see their basic information and status. Clicking "View Details" will take you to their full profile, where you can see their trip history and earnings.

### Applications
This tab shows a list of all pending applications from prospective drivers who have filled out the driver sign-up form.
*   **Review:** Check the applicant's details.
*   **Approve:** If you approve the application, their status changes. You must then go to the main "User Management" page and click **"Add User"** to create their official account, making sure to assign them the "Driver" role.
*   **Reject:** This will mark the application as rejected.
`,relatedArticles:[{slug:"manage-users",title:"Managing All Users",category:"users"}]},{slug:"manage-team",title:"Managing Your Admin Team",description:"Assign roles and permissions to your administrative staff.",content:`Admin team management is handled within the main **User Management** page.

### Assigning Roles
When you add or edit a user, you can set their "Role".
*   Selecting an admin role (Manager, Support, Finance, Marketing) automatically sets their "User Type" to "admin".
*   Each role has a specific set of permissions that determines what they can see and do in the dashboard.

### Permission Levels
*   **Manager:** Has full access to all settings and features.
*   **Support:** Can manage users, trips, and support tickets, but cannot access financial settings.
*   **Finance:** Can view financial reports and manage payouts, but cannot change operational settings.
*   **Marketing:** Can manage promotions and send notifications, but cannot see sensitive financial or user data.
`}]},{slug:"financials",title:"Financials & Payouts",articles:[{slug:"payouts",title:"Processing Driver Payouts",description:"How to review and approve withdrawal requests from drivers.",content:`The "Payouts & Requests" page (More -> Payouts) is where you handle all financial disbursements to your drivers.

### Pending Requests
The "Pending" tab lists all active withdrawal requests from drivers. Each card shows the requested amount and the driver's name.
*   **Approve:** Clicking "Approve" will deduct the amount from the driver's in-app wallet balance and mark the request as complete. This action is final.
*   **Reject:** Clicking "Reject" will deny the request without any funds being moved.

### History
The "History" tab shows a complete log of all past withdrawal requests, both approved and rejected, providing a clear audit trail.
`},{slug:"reports",title:"Generating Financial Reports",description:"Export data on transactions, shipments, and users for bookkeeping.",content:`The "Report" page (More -> Report) allows you to export your data for analysis or accounting.

1.  **Select Report Type**: Choose the data you want to export (e.g., Shipments, New Users, Transactions).
2.  **Select Date Range**: Use the date picker to define the period for your report.
3.  **Generate**: Click "Generate Report". The data will appear in a table below.
4.  **Export**: Click "Export CSV" to download the generated data as a CSV file, which can be opened in spreadsheet software.
`}]},{slug:"settings",title:"Configuration & Settings",articles:[{slug:"general-settings",title:"General App Settings",description:"Configure your app name, support contacts, and base currency.",content:`This page (More -> General) contains the core configuration for your application.

*   **App Name**: The name that appears throughout the application and to your users.
*   **Support Contact**: The email and phone number provided to users when they need help.
*   **Currency**: The three-letter currency code (e.g., NGN) used for all financial values in the app.
`},{slug:"manage-routes",title:"Creating Service Routes",description:"Define the travel corridors and base prices for passenger trips.",content:`This page (More -> Routes) is where you define the routes your service operates on. A route is a connection between two terminals.

### Creating a Route
1.  Click **"Create New Route"**.
2.  Give the route a **descriptive name** (e.g., "Jibowu -> Utako (Day)").
3.  Select an **Origin Terminal** and a **Destination Terminal**. Terminals must be created first.
4.  Set a **Base Fare** for a single seat on this route.
5.  You can optionally link it to a **Reverse Route** to enable smart return-trip scheduling.

Once a route is created, you can schedule departures on it from the **Departures** page.
`,relatedArticles:[{slug:"manage-terminals",title:"Managing Terminals",category:"settings"},{slug:"schedule-departures",title:"Scheduling Departures",category:"bookings"}]},{slug:"manage-terminals",title:"Managing Terminals",description:"Add or edit your physical locations, such as bus stops and offices.",content:`Terminals are your physical operational locations. You must create terminals before you can create routes between them.

### Creating a Terminal
1.  Navigate to the **Terminals** page (More -> Terminals).
2.  Click **"New Terminal"**.
3.  Fill in the details:
    *   **Terminal Name**: The public name of the location (e.g., "Utako Park, Abuja").
    *   **State & City**: The location of the terminal.
    *   **Full Address**: The specific street address.
4.  Set the status to **"Active"** to make it available for route creation.
`},{slug:"manage-vehicles",title:"Managing Your Fleet",description:"Add and assign vehicles to your drivers.",content:`This page (More -> Vehicles) is where you manage your fleet.

### Adding a Vehicle
1.  Click **"Add Vehicle"**.
2.  Fill in the vehicle's details, such as make, model, year, and license plate.
3.  You can optionally assign a **Primary Driver** to the vehicle. This driver will be pre-selected when you create a departure using this vehicle.
`},{slug:"charter-packages",title:"Configuring Charter Packages",description:"Create and manage the service tiers for vehicle charters.",content:`Charter Packages are templates for your private hire service.

### Creating a Package
1.  Navigate to the **Charter Packages** page (More -> Charter Packages).
2.  Click **"New Package"**.
3.  Define the package:
    *   **Name & Description**: e.g., "Gold Class" - includes A/C, refreshments.
    *   **Base Price**: The starting price for the hire.
    *   **Daily Rate**: The additional cost for each extra day of hire.
    *   **Features**: Toggle optional add-ons like "Security Escort" or "Refreshments".
            
These packages will be presented to users when they choose to charter a vehicle.
`}]}];var n=r(68570);let o=(0,n.createProxy)(String.raw`/root/app/src/app/admin/dashboard/help/[category]/[slug]/client-page.tsx`),{__esModule:l,$$typeof:c}=o;o.default;let d=(0,n.createProxy)(String.raw`/root/app/src/app/admin/dashboard/help/[category]/[slug]/client-page.tsx#HelpArticleClientPage`);function u({params:e}){let t=s.find(t=>t.slug===e.category),r=t?.articles.find(t=>t.slug===e.slug);return r||(0,i.notFound)(),a.jsx(d,{article:r})}async function p(){return s.flatMap(e=>e.articles.map(t=>({category:e.slug,slug:t.slug})))}},11170:(e,t,r)=>{"use strict";r.r(t),r.d(t,{$$typeof:()=>n,__esModule:()=>s,default:()=>o});var a=r(68570);let i=(0,a.createProxy)(String.raw`/root/app/src/app/admin/dashboard/help/layout.tsx`),{__esModule:s,$$typeof:n}=i;i.default;let o=(0,a.createProxy)(String.raw`/root/app/src/app/admin/dashboard/help/layout.tsx#default`)},86120:(e,t,r)=>{"use strict";r.r(t),r.d(t,{$$typeof:()=>n,__esModule:()=>s,default:()=>o});var a=r(68570);let i=(0,a.createProxy)(String.raw`/root/app/src/app/admin/dashboard/layout.tsx`),{__esModule:s,$$typeof:n}=i;i.default;let o=(0,a.createProxy)(String.raw`/root/app/src/app/admin/dashboard/layout.tsx#default`)}};var t=require("../../../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),a=t.X(0,[8948,8172,1915,4263,9691,5911,1244,1228,6999,2087,2021,7802],()=>r(56999));module.exports=a})();