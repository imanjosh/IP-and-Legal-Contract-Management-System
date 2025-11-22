/*
Note on Oracle Compatibility:
This script is designed for an Oracle database (CS304). Oracle does not support the
'ON UPDATE CASCADE' clause for foreign key constraints, as told in class. Where this action
would have been appropriate, the clause has been omitted, and Oracle's default 'NO ACTION'
rule will apply to prevent updates that would break referential integrity.
*/


DROP TABLE Uses CASCADE CONSTRAINTS;
DROP TABLE "Case" CASCADE CONSTRAINTS;
DROP TABLE IP_Validation CASCADE CONSTRAINTS;
DROP TABLE Patent CASCADE CONSTRAINTS;
DROP TABLE Trademark CASCADE CONSTRAINTS;
DROP TABLE Trade_Secret CASCADE CONSTRAINTS;
DROP TABLE ConsultationBase CASCADE CONSTRAINTS;
DROP TABLE ConsultationType CASCADE CONSTRAINTS;
DROP TABLE Legal_Document CASCADE CONSTRAINTS;
DROP TABLE Court CASCADE CONSTRAINTS;
DROP TABLE IP_merge_has_an CASCADE CONSTRAINTS;
DROP TABLE Client CASCADE CONSTRAINTS;
DROP TABLE Consultant_Lawyer CASCADE CONSTRAINTS;
DROP TABLE Organization_Type CASCADE CONSTRAINTS;
DROP TABLE Seniority CASCADE CONSTRAINTS;
DROP TABLE Jurisdiction CASCADE CONSTRAINTS;
DROP TABLE DurationFee CASCADE CONSTRAINTS;
DROP TABLE DocTypeIssue CASCADE CONSTRAINTS;


CREATE TABLE Organization_Type (
    organization VARCHAR(255),
    client_type VARCHAR(100),
    PRIMARY KEY (organization)
);

INSERT INTO Organization_Type VALUES ('TechCorp', 'Technology');
INSERT INTO Organization_Type VALUES ('BioHealth Inc.', 'Healthcare');
INSERT INTO Organization_Type VALUES ('EduSmart Ltd.', 'Education');
INSERT INTO Organization_Type VALUES ('FinServe', 'Finance');
INSERT INTO Organization_Type VALUES ('AgroGrow', 'Agriculture');


CREATE TABLE Client (
    client_id INTEGER,
    name VARCHAR(255) NOT NULL,
    contact_info VARCHAR(255) NOT NULL,
    organization VARCHAR(255),
    PRIMARY KEY (client_id),
    -- ON DELETE SET NULL: A Client record should be kept even if their Organization_Type is deleted
    FOREIGN KEY (organization) REFERENCES Organization_Type(organization) ON DELETE SET NULL,
    UNIQUE (name, contact_info)
);


INSERT INTO Client VALUES (1, 'Alice Johnson', 'alice@techcorp.com', 'TechCorp');
INSERT INTO Client VALUES (2, 'Bob Smith', 'bob@biohealth.com', 'BioHealth Inc.');
INSERT INTO Client VALUES (3, 'Charlie Davis', 'charlie@edusmart.com', 'EduSmart Ltd.');
INSERT INTO Client VALUES (4, 'Diana Brown', 'diana@finserve.com', 'FinServe');
INSERT INTO Client VALUES (5, 'Ethan White', 'ethan@agrogrow.com', 'AgroGrow');


CREATE TABLE IP_merge_has_an (
    ip_id INTEGER,
    filing_date DATE,
    status VARCHAR(50),
    description CLOB,
    title VARCHAR(255),
    registration_number VARCHAR(100) NOT NULL,
    client_id INTEGER,
    PRIMARY KEY (ip_id),
    -- ON DELETE SET NULL: An IP record is valuable and should be kept even if the client who owns it is deleted
    FOREIGN KEY (client_id) REFERENCES Client(client_id) ON DELETE SET NULL,
    UNIQUE (registration_number)
);


INSERT INTO IP_merge_has_an VALUES (101, DATE '2020-03-15', 'Approved', 'Smart sensor patent', 'Smart Sensor', 'REG-001', 1);
INSERT INTO IP_merge_has_an VALUES (102, DATE '2021-06-20', 'Pending', 'AI drug discovery algorithm', 'AI Drug Discovery', 'REG-002', 2);
INSERT INTO IP_merge_has_an VALUES (103, DATE '2019-11-05', 'Expired', 'Online learning platform', 'EduLearn', 'REG-003', 3);
INSERT INTO IP_merge_has_an VALUES (104, DATE '2022-02-10', 'Approved', 'Mobile banking app', 'BankEase', 'REG-004', 4);
INSERT INTO IP_merge_has_an VALUES (105, DATE '2023-08-25', 'Pending', 'Organic fertilizer formula', 'GreenBoost', 'REG-005', 5);


CREATE TABLE Seniority (
    years_experience INTEGER,
    seniority_level VARCHAR(100),
    PRIMARY KEY (years_experience)
);

INSERT INTO Seniority VALUES (1, 'Junior');
INSERT INTO Seniority VALUES (3, 'Intermediate');
INSERT INTO Seniority VALUES (5, 'Senior');
INSERT INTO Seniority VALUES (8, 'Lead');
INSERT INTO Seniority VALUES (10, 'Principal');


CREATE TABLE Consultant_Lawyer (
    consultant_id INTEGER,
    name VARCHAR(255) NOT NULL,
    license_number VARCHAR(100) NOT NULL,
    years_experience INTEGER,
    specialization VARCHAR(255),
    contact_details VARCHAR(255),
    PRIMARY KEY (consultant_id),
    -- ON DELETE SET NULL: A consultant's record should be kept even if their seniority level is removed
    FOREIGN KEY (years_experience) REFERENCES Seniority(years_experience) ON DELETE SET NULL,
    UNIQUE (license_number),
    UNIQUE (name, contact_details)
);


INSERT INTO Consultant_Lawyer VALUES (201, 'Laura King', 'LIC-1001', 5, 'Intellectual Property', 'laura@lawfirm.com');
INSERT INTO Consultant_Lawyer VALUES (202, 'Mark Lee', 'LIC-1002', 3, 'Patent Law', 'mark@lawfirm.com');
INSERT INTO Consultant_Lawyer VALUES (203, 'Nina Patel', 'LIC-1003', 8, 'Corporate Law', 'nina@lawfirm.com');
INSERT INTO Consultant_Lawyer VALUES (204, 'Oscar Reed', 'LIC-1004', 10, 'Trademark Law', 'oscar@lawfirm.com');
INSERT INTO Consultant_Lawyer VALUES (205, 'Paula Zhang', 'LIC-1005', 1, 'Copyright Law', 'paula@lawfirm.com');


CREATE TABLE IP_Validation (
    ip_id INTEGER,
    valuation_id INTEGER,
    file_location VARCHAR(255),
    valuation_date DATE,
    value DECIMAL(15, 2),
    methodology CLOB,
    PRIMARY KEY (ip_id, valuation_id),
    -- ON DELETE CASCADE: An IP validation record is meaningless without the core IP record it belongs to
    FOREIGN KEY (ip_id) REFERENCES IP_merge_has_an(ip_id) ON DELETE CASCADE
);

INSERT INTO IP_Validation VALUES (101, 1, 'vault/patents/smart_sensor.pdf', DATE '2021-01-10', 120000.00, 'Cost-based valuation');
INSERT INTO IP_Validation VALUES (102, 1, 'vault/patents/ai_drug.pdf', DATE '2022-07-05', 250000.00, 'Market comparison');
INSERT INTO IP_Validation VALUES (103, 1, 'vault/patents/edulearn.pdf', DATE '2020-12-12', 50000.00, 'Discounted cash flow');
INSERT INTO IP_Validation VALUES (104, 1, 'vault/patents/bankease.pdf', DATE '2023-03-18', 175000.00, 'Income approach');
INSERT INTO IP_Validation VALUES (105, 1, 'vault/patents/greenboost.pdf', DATE '2024-02-20', 95000.00, 'Cost estimation');


CREATE TABLE Patent (
    ip_id INTEGER,
    patent_number VARCHAR(100) NOT NULL,
    PRIMARY KEY (ip_id),
    -- ON DELETE CASCADE: A Patent is a specific type of IP. If the main IP record is deleted, this must be deleted too
    FOREIGN KEY (ip_id) REFERENCES IP_merge_has_an(ip_id) ON DELETE CASCADE,
    UNIQUE (patent_number)
);

INSERT INTO Patent VALUES (101, 'PAT-001');
INSERT INTO Patent VALUES (102, 'PAT-002');
INSERT INTO Patent VALUES (103, 'PAT-003');
INSERT INTO Patent VALUES (104, 'PAT-004');
INSERT INTO Patent VALUES (105, 'PAT-005');


CREATE TABLE Trademark (
    ip_id INTEGER,
    class VARCHAR(255),
    PRIMARY KEY (ip_id),
    -- ON DELETE CASCADE: A Trademark is a specific type of IP. If the main IP record is deleted, this must be deleted too
    FOREIGN KEY (ip_id) REFERENCES IP_merge_has_an(ip_id) ON DELETE CASCADE
);

INSERT INTO Trademark VALUES (101, 'Class A');
INSERT INTO Trademark VALUES (102, 'Class B');
INSERT INTO Trademark VALUES (103, 'Class C');
INSERT INTO Trademark VALUES (104, 'Class D');
INSERT INTO Trademark VALUES (105, 'Class E');


CREATE TABLE Copyright (
    ip_id INTEGER,
    registration_date DATE,
    PRIMARY KEY (ip_id),
    -- ON DELETE CASCADE: A Copyright is a specific type of IP. If the main IP record is deleted, this must be deleted too
    FOREIGN KEY (ip_id) REFERENCES IP_merge_has_an(ip_id) ON DELETE CASCADE
);

INSERT INTO Copyright VALUES (101, DATE '2020-04-01');
INSERT INTO Copyright VALUES (102, DATE '2021-08-10');
INSERT INTO Copyright VALUES (103, DATE '2019-12-15');
INSERT INTO Copyright VALUES (104, DATE '2022-05-25');
INSERT INTO Copyright VALUES (105, DATE '2023-09-05');


CREATE TABLE Trade_Secret (
    ip_id INTEGER,
    secrecy_level VARCHAR(100),
    PRIMARY KEY (ip_id),
    -- ON DELETE CASCADE: A Trade_Secret is a specific type of IP. If the main IP record is deleted, this must be deleted too
    FOREIGN KEY (ip_id) REFERENCES IP_merge_has_an(ip_id) ON DELETE CASCADE
);

INSERT INTO Trade_Secret VALUES (101, 'High');
INSERT INTO Trade_Secret VALUES (102, 'Medium');
INSERT INTO Trade_Secret VALUES (103, 'Low');
INSERT INTO Trade_Secret VALUES (104, 'High');
INSERT INTO Trade_Secret VALUES (105, 'Medium');



CREATE TABLE Jurisdiction (
    jurisdiction VARCHAR(255),
    location VARCHAR(255),
    PRIMARY KEY (jurisdiction)
);

INSERT INTO Jurisdiction VALUES ('BC Supreme Court', 'Vancouver');
INSERT INTO Jurisdiction VALUES ('Ontario Court', 'Toronto');
INSERT INTO Jurisdiction VALUES ('Alberta Court', 'Calgary');
INSERT INTO Jurisdiction VALUES ('Quebec Court', 'Montreal');
INSERT INTO Jurisdiction VALUES ('Federal Court', 'Ottawa');


CREATE TABLE Court (
    court_id INTEGER,
    name VARCHAR(255),
    jurisdiction VARCHAR(255),
    PRIMARY KEY (court_id),
    -- ON DELETE SET NULL: A court's record should be kept even if its jurisdiction is removed from the system
    FOREIGN KEY (jurisdiction) REFERENCES Jurisdiction(jurisdiction) ON DELETE SET NULL
);

INSERT INTO Court VALUES (301, 'Vancouver Supreme Court', 'BC Supreme Court');
INSERT INTO Court VALUES (302, 'Toronto High Court', 'Ontario Court');
INSERT INTO Court VALUES (303, 'Calgary Court of Law', 'Alberta Court');
INSERT INTO Court VALUES (304, 'Montreal Court', 'Quebec Court');
INSERT INTO Court VALUES (305, 'Federal Court of Canada', 'Federal Court');


CREATE TABLE DocTypeIssue (
    type VARCHAR(100),
    issue_date DATE,
    expiry_date DATE,
    PRIMARY KEY (type, issue_date)
);

INSERT INTO DocTypeIssue VALUES ('Affidavit', DATE '2021-01-01', DATE '2024-01-01');
INSERT INTO DocTypeIssue VALUES ('Contract', DATE '2020-05-15', DATE '2025-05-15');
INSERT INTO DocTypeIssue VALUES ('Report', DATE '2022-03-10', DATE '2027-03-10');
INSERT INTO DocTypeIssue VALUES ('Agreement', DATE '2019-08-20', DATE '2024-08-20');
INSERT INTO DocTypeIssue VALUES ('License', DATE '2023-01-05', DATE '2028-01-05');


CREATE TABLE Legal_Document (
    document_id INTEGER,
    title VARCHAR(255),
    type VARCHAR(100),
    issue_date DATE,
    PRIMARY KEY (document_id),
    -- ON DELETE SET NULL: A legal document record is important and should be kept even if its type/issue date record is deleted
    FOREIGN KEY (type, issue_date) REFERENCES DocTypeIssue(type, issue_date) ON DELETE SET NULL
);

INSERT INTO Legal_Document VALUES (401, 'Patent Filing Affidavit', 'Affidavit', DATE '2021-01-01');
INSERT INTO Legal_Document VALUES (402, 'Client Contract', 'Contract', DATE '2020-05-15');
INSERT INTO Legal_Document VALUES (403, 'Case Report', 'Report', DATE '2022-03-10');
INSERT INTO Legal_Document VALUES (404, 'Confidentiality Agreement', 'Agreement', DATE '2019-08-20');
INSERT INTO Legal_Document VALUES (405, 'Trade License', 'License', DATE '2023-01-05');


CREATE TABLE DurationFee (
    duration_minutes INTEGER,
    fee DECIMAL(10, 2),
    PRIMARY KEY (duration_minutes)
);

INSERT INTO DurationFee VALUES (30, 100.00);
INSERT INTO DurationFee VALUES (60, 180.00);
INSERT INTO DurationFee VALUES (90, 250.00);
INSERT INTO DurationFee VALUES (120, 300.00);
INSERT INTO DurationFee VALUES (180, 400.00);



CREATE TABLE ConsultationType (
    type VARCHAR(100),
    duration_minutes INTEGER,
    PRIMARY KEY (type),
    -- ON DELETE SET NULL: The consultation type should be kept even if its associated duration/fee is deleted
    FOREIGN KEY (duration_minutes) REFERENCES DurationFee(duration_minutes) ON DELETE SET NULL
);

INSERT INTO ConsultationType VALUES ('Initial Review', 30);
INSERT INTO ConsultationType VALUES ('Detailed Assessment', 60);
INSERT INTO ConsultationType VALUES ('Follow-up', 90);
INSERT INTO ConsultationType VALUES ('Expert Opinion', 120);
INSERT INTO ConsultationType VALUES ('Full-Day Session', 180);




CREATE TABLE ConsultationBase (
    consultation_id INTEGER,
    client_id INTEGER,
    consultant_id INTEGER,
    consultation_date DATE,
    type VARCHAR(100),
    notes CLOB,
    PRIMARY KEY (consultation_id),
    -- ON DELETE SET NULL: Historical consultation records are vital and must be kept, even if a client or consultant is deleted
    FOREIGN KEY (client_id) REFERENCES Client(client_id) ON DELETE SET NULL,
    FOREIGN KEY (consultant_id) REFERENCES Consultant_Lawyer(consultant_id) ON DELETE SET NULL,
    FOREIGN KEY (type) REFERENCES ConsultationType(type) ON DELETE SET NULL
);


INSERT INTO ConsultationBase VALUES (501, 1, 201, DATE '2023-01-10', 'Initial Review', 'Discussed patent filing');
INSERT INTO ConsultationBase VALUES (502, 2, 202, DATE '2023-02-14', 'Detailed Assessment', 'Evaluated AI IP claim');
INSERT INTO ConsultationBase VALUES (503, 3, 203, DATE '2023-03-05', 'Follow-up', 'Reviewed education platform IP');
INSERT INTO ConsultationBase VALUES (504, 4, 204, DATE '2023-04-12', 'Expert Opinion', 'Trademark dispute analysis');
INSERT INTO ConsultationBase VALUES (505, 5, 205, DATE '2023-05-20', 'Full-Day Session', 'Copyright protection strategy');


CREATE TABLE "Case" (
    case_id INTEGER,
    consultant_id INTEGER NOT NULL,
    ip_id INTEGER NOT NULL,
    court_id INTEGER NOT NULL,
    description CLOB,
    status VARCHAR(50),
    open_date DATE,
    close_date DATE,
    PRIMARY KEY (case_id),
    -- NO ACTION (Default): Prevent deleting a consultant if they are assigned to a case, ensuring accountability
    FOREIGN KEY (consultant_id) REFERENCES Consultant_Lawyer(consultant_id),
    -- NO ACTION (Default): A case is fundamentally tied to an IP record, so prevent IP deletion if it's involved in a case
    FOREIGN KEY (ip_id) REFERENCES IP_merge_has_an(ip_id),
    -- NO ACTION (Default): Prevent deleting a court if it has cases assigned to it, preserving legal records
    FOREIGN KEY (court_id) REFERENCES Court(court_id),
    UNIQUE (ip_id)
);

INSERT INTO "Case" VALUES (601, 201, 101, 301, 'Patent infringement suit', 'Open', DATE '2023-01-01', NULL);
INSERT INTO "Case" VALUES (602, 202, 102, 302, 'Pending IP approval challenge', 'Open', DATE '2023-02-10', NULL);
INSERT INTO "Case" VALUES (603, 203, 103, 303, 'Expired copyright dispute', 'Closed', DATE '2022-06-01', DATE '2023-02-01');
INSERT INTO "Case" VALUES (604, 204, 104, 304, 'Trademark registration issue', 'Open', DATE '2023-03-12', NULL);
INSERT INTO "Case" VALUES (605, 205, 105, 305, 'Trade secret confidentiality breach', 'Open', DATE '2023-04-20', NULL);




CREATE TABLE Uses (
    case_id INTEGER,
    document_id INTEGER,
    PRIMARY KEY (case_id, document_id),
    -- ON DELETE CASCADE: The 'Uses' record is a relationship. If the case or document is deleted, the relationship is meaningless
    FOREIGN KEY (case_id) REFERENCES "Case"(case_id) ON DELETE CASCADE,
    FOREIGN KEY (document_id) REFERENCES Legal_Document(document_id) ON DELETE CASCADE
);


INSERT INTO Uses VALUES (601, 401);
INSERT INTO Uses VALUES (602, 402);
INSERT INTO Uses VALUES (603, 403);
INSERT INTO Uses VALUES (604, 404);
INSERT INTO Uses VALUES (605, 405);
