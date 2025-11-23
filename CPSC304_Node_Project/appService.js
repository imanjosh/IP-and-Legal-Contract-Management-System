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
             SET name = :name,
                 license_number = :license_number,
                 years_experience = :years_experience,
                 specialization = :specialization,
                 contact_details = :contact_details
             WHERE consultant_id = :consultant_id`,
            {
                consultant_id,
                name,
                license_number,
                years_experience,
                specialization,
                contact_details
            },
            { autoCommit: true }
        );

        return result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function filterConsultantsService(filters) {
    return await withOracleDB(async (connection) => {

        const sql = `
            SELECT consultant_id, name, license_number, years_experience,
                   specialization, contact_details
            FROM Consultant_Lawyer
            WHERE 1=1
                AND (:name IS NULL OR LOWER(name) LIKE LOWER(:name))
                AND (:license_number IS NULL OR license_number = :license_number)
                AND (:min_exp IS NULL OR years_experience >= :min_exp)
                AND (:max_exp IS NULL OR years_experience <= :max_exp)
                AND (:specialization IS NULL OR specialization = :specialization)
                AND (:contact IS NULL OR LOWER(contact_details) LIKE LOWER(:contact))
        `;

        const binds = {
            name: filters.name ? `%${filters.name}%` : null,
            license_number: filters.license_number || null,
            min_exp: filters.min_exp || null,
            max_exp: filters.max_exp || null,
            specialization: filters.specialization || null,
            contact: filters.contact ? `%${filters.contact}%` : null
        };

        const result = await connection.execute(sql, binds, { outFormat: oracledb.OUT_FORMAT_OBJECT });
        return result.rows;
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
             JOIN Consultant_Lawyer l
                 ON c.consultant_id = l.consultant_id
             WHERE 1=1
               AND (:name IS NULL OR LOWER(l.name) LIKE LOWER('%' || :name || '%'))
               AND (:type IS NULL OR c.type = :type)
               AND (:date_from IS NULL OR c.consultation_date >= :date_from)
               AND (:date_to IS NULL OR c.consultation_date <= :date_to)
            `,
            params
        );
        return result.rows;
    });
}




module.exports = {
    testOracleConnection,
    updateConsultant,
    filterConsultantsService,
    joinConsultationsService
};