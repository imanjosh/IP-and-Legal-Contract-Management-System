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
    const body = req.body;

    const result = await appService.updateConsultant(
        consultant_id,
        body.name,
        body.license_number,
        body.years_experience,
        body.specialization,
        body.contact_details
    );

    if (!result.success) {
        return res.status(404).json(result);
    }

    res.json(result);
});


router.post('/consultants/filter', async (req, res) => {
    const result = await appService.filterConsultantsService(req.body);
    res.json(result);
});


router.get('/consultations/join', async (req, res) => {
    const filters = {
        name: req.query.name && req.query.name.trim() !== "" ? req.query.name.trim() : null,
        type: req.query.type && req.query.type.trim() !== "" ? req.query.type.trim() : null,
        date_from: req.query.date_from && req.query.date_from.trim() !== "" ? req.query.date_from.trim() : null,
        date_to: req.query.date_to && req.query.date_to.trim() !== "" ? req.query.date_to.trim() : null,
    };

    console.log("JOIN FILTERS:", filters);

    const result = await appService.joinConsultationsService(filters);
    res.json(result);
});




router.post('/consultations/aggregate', async (req, res) => {
    const result = await appService.aggregateConsultationsService({
        min_count: req.body.min_count
    });

    res.json(result);
});


router.get('/consultants/division', async (req, res) => {
    const result = await appService.divisionConsultantsService();
    res.json(result);
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

router.delete('/cases/delete/:case_id', async (req, res) => {
    const case_id = req.params.case_id;
    
    const deleteResult = await appService.deleteCase(case_id);
    
    if (deleteResult.success) {
        res.json({ success: true, message: deleteResult.message });
    } else {
        res.status(404).json({ success: false, message: deleteResult.message });
    }
});

router.get('/consultants/projection', async (req, res) => {
    const attributes = req.query.attributes;
    
    if (!attributes) {
        return res.status(400).json({
            success: false,
            message: "Please specify attributes to project (e.g., ?attributes=name,specialization)"
        });
    }
    
    const result = await appService.projectConsultants(attributes);
    
    if (result.success) {
        res.json({ success: true, data: result.data });
    } else {
        res.status(400).json({ success: false, message: result.message });
    }
});

router.get('/cases/group-by-court', async (req, res) => {
    try {
        const rows = await appService.groupCasesByCourt();
        res.json({ success: true, data: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Error executing GROUP BY query."
        });
    }
});

router.get('/consultants/above-average', async (req, res) => {
    try {
        const rows = await appService.consultantsAboveAverage();
        res.json({ success: true, data: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Error executing nested aggregation query."
        });
    }
});



module.exports = router;