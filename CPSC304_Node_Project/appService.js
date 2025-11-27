const oracledb = require('oracledb');
const loadEnvFile = require('./utils/envUtil');

const envVariables = loadEnvFile('./.env');

// Database configuration setup. Ensure your .env file has the required database credentials.
const dbConfig = {
    user: envVariables.ORACLE_USER,
    password: envVariables.ORACLE_PASS,
    connectString: `${envVariables.ORACLE_HOST}:${envVariables.ORACLE_PORT}/${envVariables.ORACLE_DBNAME}`,
    poolMin: 1,
    poolMax: 3,
    poolIncrement: 1,
    poolTimeout: 60
};

// initialize connection pool
async function initializeConnectionPool() {
    try {
        await oracledb.createPool(dbConfig);
        console.log('Connection pool started');
    } catch (err) {
        console.error('Initialization error: ' + err.message);
    }
}

async function closePoolAndExit() {
    console.log('\nTerminating');
    try {
        await oracledb.getPool().close(10); // 10 seconds grace period for connections to finish
        console.log('Pool closed');
        process.exit(0);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

initializeConnectionPool();

process
    .once('SIGTERM', closePoolAndExit)
    .once('SIGINT', closePoolAndExit);


// ----------------------------------------------------------
// Wrapper to manage OracleDB actions, simplifying connection handling.
async function withOracleDB(action) {
    let connection;
    try {
        connection = await oracledb.getConnection(); // Gets a connection from the default pool 
        return await action(connection);
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}


// ----------------------------------------------------------
// Core functions for database operations
// Modify these functions, especially the SQL queries, based on your project's requirements and design.
async function testOracleConnection() {
    return await withOracleDB(async (connection) => {
        return true;
    }).catch(() => {
        return false;
    });
}

/*
async function fetchDemotableFromDb() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT * FROM DEMOTABLE');
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function initiateDemotable() {
    return await withOracleDB(async (connection) => {
        try {
            await connection.execute(`DROP TABLE DEMOTABLE`);
        } catch(err) {
            console.log('Table might not exist, proceeding to create...');
        }

        const result = await connection.execute(`
            CREATE TABLE DEMOTABLE (
                id NUMBER PRIMARY KEY,
                name VARCHAR2(20)
            )
        `);
        return true;
    }).catch(() => {
        return false;
    });
}

async function insertDemotable(id, name) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO DEMOTABLE (id, name) VALUES (:id, :name)`,
            [id, name],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function updateNameDemotable(oldName, newName) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `UPDATE DEMOTABLE SET name=:newName where name=:oldName`,
            [newName, oldName],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function countDemotable() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT Count(*) FROM DEMOTABLE');
        return result.rows[0][0];
    }).catch(() => {
        return -1;
    });
}

*/
async function updateConsultant(consultant_id, name, license_number, years_experience, specialization, contact_details) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `UPDATE Consultant_Lawyer
             SET name = :name, license_number = :license_number,
                 years_experience = :years_experience,
                 specialization = :specialization,
                 contact_details = :contact_details
             WHERE consultant_id = :consultant_id`,
            { consultant_id, name, license_number, years_experience, specialization, contact_details },
            { autoCommit: true }
        );

        if (result.rowsAffected === 0) {
            return { success: false, message: `No consultant found with ID ${consultant_id}` };
        }

        return { success: true, message: `Consultant ${consultant_id} updated successfully` };
    }).catch(() => {
        return { success: false, message: "Error updating consultant" };
    });
}

async function filterConsultantsService(filters) {
    return await withOracleDB(async (connection) => {
        const result = await runDynamicFilter(connection, filters);
        return {
            success: true,
            message: result.rows.length > 0 ? "Results found" : "No matching consultants",
            data: result.rows
        };
    }).catch(() => {
        return { success: false, message: "Error searching consultants" };
    });
}

async function joinConsultationsService(params) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT c.consultation_id,
                    c.consultation_date,
                    c.type,
                    DBMS_LOB.SUBSTR(c.notes, 4000) AS notes,
                    l.consultant_id,
                    l.name AS consultant_name,
                    l.specialization
             FROM ConsultationBase c
             JOIN Consultant_Lawyer l ON c.consultant_id = l.consultant_id
             WHERE 1=1
               AND (:name IS NULL OR LOWER(l.name) LIKE LOWER('%' || :name || '%'))
               AND (:type IS NULL OR c.type = :type)
               AND (:date_from IS NULL OR c.consultation_date >= :date_from)
               AND (:date_to IS NULL OR c.consultation_date <= :date_to)`,
            params
        );
        return {
            success: true,
            message: result.rows.length > 0 ? "Consultations retrieved" : "No consultations match filters",
            data: result.rows
        };
    }).catch(() => ({
        success: false,
        message: "Error fetching consultations"
    }));
}

async function aggregateConsultationsService(params) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT l.consultant_id AS "Consultant ID",
                l.name AS "Consultant Name",
                COUNT(c.consultation_id) AS "Number of Consultations"
             FROM Consultant_Lawyer l
             JOIN ConsultationBase c ON l.consultant_id = c.consultant_id
             GROUP BY l.consultant_id, l.name
             HAVING COUNT(c.consultation_id) >= :min_count
             ORDER BY COUNT(c.consultation_id) DESC`,
            params,
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        return {
            success: true,
            message: result.rows.length > 0 ?
                "Aggregated results retrieved" :
                "No consultants meet minimum consultation count",
            data: result.rows
        };
    }).catch(() => ({
        success: false,
        message: "Error aggregating consultations"
    }));
}

async function divisionConsultantsService() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT c.consultant_id, c.name
             FROM Consultant_Lawyer c
             WHERE NOT EXISTS (
                 SELECT type
                 FROM ConsultationType t
                 WHERE NOT EXISTS (
                     SELECT *
                     FROM ConsultationBase cb
                     WHERE cb.consultant_id = c.consultant_id
                     AND cb.type = t.type))`
        );
        return {
            success: true,
            message: result.rows.length > 0 ?
                "Consultants fulfilling division condition" :
                "No consultants cover all consultation types",
            data: result.rows
        };
    }).catch(() => ({
        success: false,
        message: "Error executing division query"
    }));
}

async function insertCase(case_id, consultant_id, ip_id, court_id, description, status, open_date, close_date) {
    return await withOracleDB(async (connection) => {
        try {
            // Check if consultant exists
            const consultantCheck = await connection.execute(
                `SELECT consultant_id FROM Consultant_Lawyer WHERE consultant_id = :consultant_id`,
                [consultant_id]
            );
            if (consultantCheck.rows.length === 0) {
                return { success: false, message: `Consultant with ID ${consultant_id} does not exist.` };
            }

            // Check if IP exists
            const ipCheck = await connection.execute(
                `SELECT ip_id FROM IP_merge_has_an WHERE ip_id = :ip_id`,
                [ip_id]
            );
            if (ipCheck.rows.length === 0) {
                return { success: false, message: `IP with ID ${ip_id} does not exist.` };
            }

            // Check if court exists
            const courtCheck = await connection.execute(
                `SELECT court_id FROM Court WHERE court_id = :court_id`,
                [court_id]
            );
            if (courtCheck.rows.length === 0) {
                return { success: false, message: `Court with ID ${court_id} does not exist.` };
            }

            // Insert the case
            const result = await connection.execute(
                `INSERT INTO "Case" (case_id, consultant_id, ip_id, court_id, description, status, open_date, close_date)
                 VALUES (:case_id, :consultant_id, :ip_id, :court_id, :description, :status, 
                         TO_DATE(:open_date, 'YYYY-MM-DD'), TO_DATE(:close_date, 'YYYY-MM-DD'))`,
                [case_id, consultant_id, ip_id, court_id, description, status, open_date, close_date],
                { autoCommit: true }
            );

            return { success: result.rowsAffected > 0, message: "Case inserted successfully." };
        } catch (err) {
            if (err.errorNum === 1) {
                return { success: false, message: "Case ID already exists or IP is already assigned to another case." };
            }
            throw err;
        }
    }).catch(() => {
        return { success: false, message: "Error inserting case." };
    });
}

async function deleteCase(case_id) {
    return await withOracleDB(async (connection) => {
        // Check if case exists
        const checkCase = await connection.execute(
            `SELECT case_id FROM "Case" WHERE case_id = :case_id`,
            [case_id]
        );

        if (checkCase.rows.length === 0) {
            return { success: false, message: `Case with ID ${case_id} does not exist.` };
        }

        // Delete the case (will cascade to Uses table automatically)
        const result = await connection.execute(
            `DELETE FROM "Case" WHERE case_id = :case_id`,
            [case_id],
            { autoCommit: true }
        );

        return { 
            success: result.rowsAffected > 0, 
            message: `Case ${case_id} deleted successfully. Related Uses records were also removed due to cascade.` 
        };
    }).catch(() => {
        return { success: false, message: "Error deleting case." };
    });
}

async function projectConsultants(attributesString) {
    return await withOracleDB(async (connection) => {
        // Define valid attributes
        const validAttributes = [
            'consultant_id',
            'name',
            'license_number',
            'years_experience',
            'specialization',
            'contact_details'
        ];

        // Parse and validate attributes
        const requestedAttributes = attributesString.split(',').map(attr => attr.trim().toLowerCase());
        
        // Check if all requested attributes are valid
        const invalidAttributes = requestedAttributes.filter(attr => !validAttributes.includes(attr));
        if (invalidAttributes.length > 0) {
            return {
                success: false,
                message: `Invalid attributes: ${invalidAttributes.join(', ')}. Valid attributes are: ${validAttributes.join(', ')}`
            };
        }

        if (requestedAttributes.length === 0) {
            return {
                success: false,
                message: "At least one attribute must be specified."
            };
        }

        // Build SELECT clause with requested attributes
        const selectClause = requestedAttributes.join(', ');
        
        const result = await connection.execute(
            `SELECT ${selectClause} FROM Consultant_Lawyer`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        return {
            success: true,
            data: result.rows
        };
    }).catch(() => {
        return { success: false, message: "Error executing projection query." };
    });
}

async function groupCasesByCourt() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT 
                co.court_id,
                co.name AS court_name,
                co.jurisdiction,
                COUNT(ca.case_id) AS total_cases
             FROM Court co
             LEFT JOIN "Case" ca ON co.court_id = ca.court_id
             GROUP BY co.court_id, co.name, co.jurisdiction
             ORDER BY total_cases DESC`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        return result.rows;
    });
}

async function consultantsAboveAverage() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT 
                c.consultant_id,
                c.name,
                c.specialization,
                COUNT(cb.consultation_id) AS num_consultations
             FROM Consultant_Lawyer c
             LEFT JOIN ConsultationBase cb ON c.consultant_id = cb.consultant_id
             GROUP BY c.consultant_id, c.name, c.specialization
             HAVING COUNT(cb.consultation_id) > (
                 SELECT AVG(consultation_count)
                 FROM (
                     SELECT COUNT(consultation_id) AS consultation_count
                     FROM ConsultationBase
                     GROUP BY consultant_id
                 )
             )
             ORDER BY num_consultations DESC`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        return result.rows;
    });
}



module.exports = {
    testOracleConnection,
    updateConsultant,
    filterConsultantsService,
    joinConsultationsService,
    aggregateConsultationsService,
    divisionConsultantsService,
    insertCase,
    deleteCase,
    projectConsultants,
    groupCasesByCourt,
    consultantsAboveAverage

    
};