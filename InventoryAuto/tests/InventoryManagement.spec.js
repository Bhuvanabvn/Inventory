import { test, expect } from '@playwright/test';
import { LoginPage } from '../Pages/LoginPage';
import { ProjectCreation } from '../Pages/ProjectCreation';
import { ProjectCreationForm } from '../Pages/ProjectCreationForm';
import { BulkUpload } from '../Pages/BulkUpload';
import { SavedProject } from '../Pages/SavedProject';
import { ManageInventory } from '../Pages/ManageInventory';
import { ProjectInventory } from '../Pages/ProjectInventory';
import { UnitDetails } from '../Pages/UnitDetails';

const USERNAME = 'management@adglobal360.com';
const PASSWORD = 'Mint@2026';
const RUN_ID = Date.now();

async function login(page) {
  const loginPage = new LoginPage(page);
  await loginPage.goto('/');
  await loginPage.login('management@adglobal360.com', 'Mint@2026');
  await loginPage.verifyLoggedIn();
}

/** Creates a project of the given type and returns its name. */
async function createProject(page, { type, location, totalUnits, status }) {
  const projectName = `QA ${type} Project ${RUN_ID}`;
  const projectPage = new ProjectCreation(page);
  const form = new ProjectCreationForm(page);

  await projectPage.goToProjectCreation();
  await projectPage.openCreateProjectDialog();
  await form.fillAndSave({ name: projectName, type, totalUnits, status, location });
  await projectPage.verifySuccessMessage();
  await projectPage.closeSuccessDialog();

  return projectName;
}

test.describe.serial('Inventory Management - Project Creation, Inventory, Add Unit, Bulk Upload', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  // ---------------------------------------------------------------------
  // 1) Project Creation - field validation + happy path
  // ---------------------------------------------------------------------
  test('IM_001 Field-level validation on empty form', async ({ page }) => {
    const projectPage = new ProjectCreation(page);
    const form = new ProjectCreationForm(page);

    await projectPage.goToProjectCreation();
    await projectPage.openCreateProjectDialog();

    await form.clickSave();
    await form.verifyProjectNameRequiredError();
    await form.verifyLocationRequiredError();
    await form.verifyProjectTypeRequiredError();
    await form.verifyTotalUnitsError();
    await form.verifyStatusRequiredError();
  });

  test('IM_002 Create a Plot project with valid data', async ({ page }) => {
    const projectName = await createProject(page, {
      type: 'Plot',
      location: 'Chennai',
      totalUnits: '10',
      status: 'Active',
    });
    expect(projectName).toContain('Plot');
  });

  // ---------------------------------------------------------------------
  // 2) Verify the created project shows up in the Saved Projects list
  // ---------------------------------------------------------------------
  test('IM_003 Verify project appears in Saved Projects table', async ({ page }) => {
    const projectPage = new ProjectCreation(page);
    const savedProject = new SavedProject(page);
    const projectName = `QA Plot Project ${RUN_ID}`;

    await projectPage.goToProjectCreation();
    await projectPage.openSavedProjectsTab();
    await savedProject.verifyTableHeadersVisible();
    await savedProject.verifyProjectRowVisible(projectName);
  });

  // ---------------------------------------------------------------------
  // 3) From the Saved Projects list, open Inventory, Add Unit, verify it
  //    Repeated for Plot, Villa, and Apartment project types.
  // ---------------------------------------------------------------------
 const unitScenarios = [
    {
        type: 'Plot',
        existingProject: true,
        unit: {
            unitNumber: 'P-NEW-01',
            area: '1500',
            facing: 'North',
            price: '2500000',
            status: 'Available',
        },
    },
    {
        type: 'Villa',
        existingProject: false,
        unit: {
            unitNumber: 'V-NEW-01',
            area: '2000',
            facing: 'East',
            price: '5000000',
            status: 'Available',
            extraFields: {},
        },
    },
    {
        type: 'Apartment',
        existingProject: false,
        unit: {
            unitNumber: 'A-NEW-01',
            area: '1100',
            facing: 'West',
            price: '3500000',
            status: 'Available',
            extraFields: {},
        },
    },
];

//for (const scenario of unitScenarios) {

//     test(`IM_004 Add ${scenario.type} unit and verify it appears in inventory`, async ({ page }) => {

//         const projectPage = new ProjectCreation(page);
//         const savedProject = new SavedProject(page);
//         const projectInventory = new ProjectInventory(page);

//         let projectName;

//         if (scenario.existingProject) {

//             // Use the Plot project already created in IM_002
//             projectName = `QA Plot Project ${RUN_ID}`;

//         } else {

//             // Create new project for Villa / Apartment
//             projectName = await createProject(page, {
//                 type: scenario.type,
//                 location: 'Chennai',
//                 totalUnits: '5',
//                 status: 'Active',
//             });
//         }

//         console.log(`Using project: ${projectName}`);

//         await projectPage.openSavedProjectsTab();

//         await savedProject.clickInventoryForProject(projectName);

//         await projectInventory.verifyPageTitleContains(projectName);

//         await projectInventory.addUnit(scenario.unit);

//         await projectInventory.verifyUnitVisible(
//             scenario.unit.unitNumber
//         );
//     });
// }

//   // ---------------------------------------------------------------------
//   // 4) Unit details check (confirmed live against a Plot project)
//   // ---------------------------------------------------------------------
//   test('IM_005 Verify inventory counts and unit details', async ({ page }) => {
//     const projectPage = new ProjectCreation(page);
//     const savedProject = new SavedProject(page);
//     const projectInventory = new ProjectInventory(page);
//     const unitDetails = new UnitDetails(page);
//     const projectName = `QA Plot Project ${RUN_ID}`;

//     await projectPage.goToProjectCreation();
//     await projectPage.openSavedProjectsTab();
//     await savedProject.clickInventoryForProject(projectName);

//     await projectInventory.verifyTotalUnitsCount('10');
//     await projectInventory.verifyAvailableCount('10');

//     await projectInventory.openUnitByCode('P1');
//     await unitDetails.verifyVisible();
//     await unitDetails.verifyUnitNumber('P1');
//   });

//   // ---------------------------------------------------------------------
//   // 5) Bulk upload scenario
//   //    Confirmed live up to opening the "Select The Needed Upload Option"
//   //    dialog and choosing "Bulk Upload". Skipped by default - the
//   //    resulting upload screen (file picker/submit/success) is
//   //    unconfirmed. See BulkUpload.js TODOs. Un-skip once verified and a
//   //    real sample file exists under tests/files/.
//   // ---------------------------------------------------------------------
//   test.skip('IM_006 Bulk upload units via file', async ({ page }) => {
//     const projectPage = new ProjectCreation(page);
//     const savedProject = new SavedProject(page);
//     const bulkUpload = new BulkUpload(page);
//     const projectName = `QA Plot Project ${RUN_ID}`;

//     await projectPage.goToProjectCreation();
//     await projectPage.openSavedProjectsTab();
//     await savedProject.clickInventoryForProject(projectName);

//     await bulkUpload.bulkUploadFileEndToEnd('tests/files/sample-units.xlsx');
//   });

//   // This part IS confirmed live: opening the options dialog and seeing
//   // "Bulk Upload" as a real, clickable choice.
//   test('IM_006a Upload button opens the Select Upload Option dialog', async ({ page }) => {
//     const projectPage = new ProjectCreation(page);
//     const savedProject = new SavedProject(page);
//     const bulkUpload = new BulkUpload(page);
//     const projectName = `QA Plot Project ${RUN_ID}`;

//     await projectPage.goToProjectCreation();
//     await projectPage.openSavedProjectsTab();
//     await savedProject.clickInventoryForProject(projectName);

//     await bulkUpload.openUploadOptions();
//     await expect(bulkUpload.bulkUploadOption).toBeVisible();
//   });

//   // ---------------------------------------------------------------------
//   // 6) Cleanup - delete all projects created during this run
//   // ---------------------------------------------------------------------
//   test('IM_999 Cleanup - delete projects created during this run', async ({ page }) => {
//     const manageInventory = new ManageInventory(page);
//     const projectPage = new ProjectCreation(page);

//     for (const type of ['Plot', 'Villa', 'Apartment']) {
//       const projectName = `QA ${type} Project ${RUN_ID}`;
//       await projectPage.goToManageInventory();
//       await manageInventory.clickDeleteForProject(projectName);
//       await manageInventory.verifyDeleteConfirmationPopup();
//       await manageInventory.clickOkayOnPopup();
//       await manageInventory.verifyDeleteSuccessMessage();
//       await manageInventory.closeSuccessDialog();
//     }
//   });

// });
