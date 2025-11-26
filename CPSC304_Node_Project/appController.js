const express = require('express');
const appService = require('./appService');

const router = express.Router();

// ----------------------------------------------------------
// API endpoints
// Modify or extend these routes based on your project's needs.
router.get('/check-db-connection', async (req, res) => {
    const isConnect = await appService.testOracleConnection();
    if (isConnect) {
        res.send('connected');
    } else {
        res.send('unable to connect');
    }
});

/*
router.get('/demotable', async (req, res) => {
    const tableContent = await appService.fetchDemotableFromDb();
    res.json({data: tableContent});
});

router.post("/initiate-demotable", async (req, res) => {
    const initiateResult = await appService.initiateDemotable();
    if (initiateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/insert-demotable", async (req, res) => {
    const { id, name } = req.body;
    const insertResult = await appService.insertDemotable(id, name);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/update-name-demotable", async (req, res) => {
    const { oldName, newName } = req.body;
    const updateResult = await appService.updateNameDemotable(oldName, newName);
    if (updateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.get('/count-demotable', async (req, res) => {
    const tableCount = await appService.countDemotable();
    if (tableCount >= 0) {
        res.json({ 
            success: true,  
            count: tableCount
        });
    } else {
        res.status(500).json({ 
            success: false, 
            count: tableCount
        });
    }
});
*/

router.put('/consultants/:consultant_id', async (req, res) => {
    const consultant_id = req.params.consultant_id;

    const {
        name,
        license_number,
        years_experience,
        specialization,
        contact_details
    } = req.body;

    if (!name || !license_number || !years_experience || !specialization || !contact_details) {
        return res.status(400).json({
            success: false,
            message: "Missing required fields."
        });
    }

    try {
        const updated = await appService.updateConsultant(
            consultant_id,
            name,
            license_number,
            years_experience,
            specialization,
            contact_details
        );

        if (updated) {
            res.json({ success: true, message: "Consultant updated successfully." });
        } else {
            res.status(404).json({
                success: false,
                message: "Consultant not found."
            });
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Internal server error while updating consultant."
        });
    }
});


router.get('/consultants/filter', async (req, res) => {
    try {
        const filters = {
            name: req.query.name || null,
            license_number: req.query.license_number || null,
            min_exp: req.query.min_exp || null,
            max_exp: req.query.max_exp || null,
            specialization: req.query.specialization || null,
            contact: req.query.contact || null
        };

        const rows = await appService.filterConsultantsService(filters);
        res.json({ success: true, data: rows });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Internal error while filtering consultants."
        });
    }
});

router.get('/consultations/join', async (req, res) => {
    try {
        const filters = {
            name: req.query.name || null,
            type: req.query.type || null,
            date_from: req.query.date_from || null,
            date_to: req.query.date_to || null
        };

        const rows = await appService.joinConsultationsService(filters);

        res.json({ success: true, data: rows });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Internal error while executing join query."
        });
    }
});

router.get('/consultations/aggregate', async (req, res) => {
    try {
        const minCount = parseInt(req.query.min_count, 10) || 0;

        const rows = await appService.aggregateConsultationsService({
            min_count: minCount
        });

        res.json({ success: true, data: rows });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Internal error while aggregating."
        });
    }
});

router.get('/consultants/division', async (req, res) => {
    try {
        const rows = await appService.divisionConsultantsService();
        res.json({ success: true, data: rows });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Internal error while performing division query."
        });
    }
});

router.post('/cases/insert', async (req, res) => {
    const { case_id, consultant_id, ip_id, court_id, description, status, open_date, close_date } = req.body;
    
    const insertResult = await appService.insertCase(
        case_id, 
        consultant_id, 
        ip_id, 
        court_id, 
        description, 
        status, 
        open_date, 
        close_date
    );
    
    if (insertResult.success) {
        res.json({ success: true, message: insertResult.message });
    } else {
        res.status(400).json({ success: false, message: insertResult.message });
    }
});



module.exports = router;