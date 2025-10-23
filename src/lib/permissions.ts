/**
 * @project Engraced Smiles
 * @author Daniel Innocent <@mdtbmw>
 * @copyright Copyright (c) 2024. All rights reserved.
 * This software is the exclusive property of Daniel Innocent.
 * A license has been granted to Mr. Ismail Muhammed for resale to Engraced Smiles.
 */

export type Role = 'Manager' | 'Support' | 'Finance' | 'Marketing';

export const PERMISSIONS: Record<Role, string[]> = {
  Manager: [
    // Full Access
    'viewDashboard', 'viewOperations', 'viewFinancials', 'viewAnalytics',
    'manageShipments', 'manageUsers', 'manageDrivers', 'viewMore',
    'manageAccount', 'manageTeam', 'managePayouts', 'managePayments',
    'sendNotifications', 'viewReports', 'manageTemplates', 'managePrograms',
    'managePromotions', 'manageSupport', 'manageEmergencies',
    'manageSettings', 'manageFrontend', 'manageSystem', 'viewMarketing',
    'manageInventory'
  ],
  Support: [
    'viewDashboard', 'viewOperations',
    'manageShipments', 'manageUsers', 'manageDrivers', 'viewMore',
    'manageAccount', 'manageSupport', 'manageEmergencies',
  ],
  Finance: [
    'viewDashboard', 'viewFinancials', 'viewAnalytics', 'viewMore',
    'manageAccount', 'managePayouts', 'managePayments', 'viewReports',
    'manageSettings', // Can view/edit pricing
  ],
  Marketing: [
    'viewDashboard', 'viewMarketing', 'viewAnalytics', 'viewMore',
    'manageAccount', 'sendNotifications', 'manageTemplates',
    'managePrograms', 'managePromotions', 'manageFrontend'
  ],
};
/**
 * This file is part of the Engraced Smiles project.
 * Unauthorized reproduction or distribution of this file, or any portion of it,
 * may result in severe civil and criminal penalties, and will be prosecuted
 * to the maximum extent possible under the law.
 *
 * @see https://github.com/mdtbmw
 */
