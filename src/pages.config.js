/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import Calculator from './pages/Calculator';
import Communications from './pages/Communications';
import Contacts from './pages/Contacts';
import Dashboard from './pages/Dashboard';
import Deals from './pages/Deals';
import EtsyCalculator from './pages/EtsyCalculator';
import Filaments from './pages/Filaments';
import Hardware from './pages/Hardware';
import InventoryManager from './pages/InventoryManager';
import Leads from './pages/Leads';
import Packaging from './pages/Packaging';
import Printers from './pages/Printers';
import QuoteHistory from './pages/QuoteHistory';
import Reports from './pages/Reports';
import Sales from './pages/Sales';
import Settings from './pages/Settings';
import SocialCampaigns from './pages/SocialCampaigns';
import SocialConnections from './pages/SocialConnections';
import SocialLibrary from './pages/SocialLibrary';
import Tasks from './pages/Tasks';
import Tools from './pages/Tools';
import UserManagement from './pages/UserManagement';
import SocialCalendar from './pages/SocialCalendar';
import SocialAnalytics from './pages/SocialAnalytics';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Calculator": Calculator,
    "Communications": Communications,
    "Contacts": Contacts,
    "Dashboard": Dashboard,
    "Deals": Deals,
    "EtsyCalculator": EtsyCalculator,
    "Filaments": Filaments,
    "Hardware": Hardware,
    "InventoryManager": InventoryManager,
    "Leads": Leads,
    "Packaging": Packaging,
    "Printers": Printers,
    "QuoteHistory": QuoteHistory,
    "Reports": Reports,
    "Sales": Sales,
    "Settings": Settings,
    "SocialCampaigns": SocialCampaigns,
    "SocialConnections": SocialConnections,
    "SocialLibrary": SocialLibrary,
    "Tasks": Tasks,
    "Tools": Tools,
    "UserManagement": UserManagement,
    "SocialCalendar": SocialCalendar,
    "SocialAnalytics": SocialAnalytics,
}

export const pagesConfig = {
    mainPage: "Calculator",
    Pages: PAGES,
    Layout: __Layout,
};