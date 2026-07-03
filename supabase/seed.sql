-- =============================================================
-- CBSE Class 10 AI Study Assistant - Seed data (MVP)
-- Run AFTER migrations 0001 + 0002 (SQL editor or `supabase db reset`).
-- Safe to re-run: uses fixed UUIDs with ON CONFLICT DO NOTHING.
-- =============================================================

-- -------------------------------------------------------------
-- Subjects
-- -------------------------------------------------------------
insert into public.subjects (id, name, description) values
  ('11111111-0000-0000-0000-000000000001', 'Mathematics', 'CBSE Class 10 Mathematics (Standard) based on NCERT.'),
  ('11111111-0000-0000-0000-000000000002', 'Science', 'CBSE Class 10 Science - Physics, Chemistry and Biology from NCERT.'),
  ('11111111-0000-0000-0000-000000000003', 'Social Science', 'History, Geography, Political Science and Economics.'),
  ('11111111-0000-0000-0000-000000000004', 'English', 'English Language and Literature (First Flight, Footprints Without Feet).'),
  ('11111111-0000-0000-0000-000000000005', 'Hindi', 'Hindi Course B (Sparsh, Sanchayan) with Vyakaran.'),
  ('11111111-0000-0000-0000-000000000006', 'Computer Applications / IT', 'Information Technology (Code 402): Employability Skills, Subject-Specific Skills and Practicals.')
on conflict (id) do nothing;

-- -------------------------------------------------------------
-- Chapters: Mathematics
-- -------------------------------------------------------------
insert into public.chapters (id, subject_id, chapter_number, name, marks_weightage) values
  ('22222222-0000-0000-0000-000000010001', '11111111-0000-0000-0000-000000000001', 1,  'Real Numbers', 6),
  ('22222222-0000-0000-0000-000000010002', '11111111-0000-0000-0000-000000000001', 2,  'Polynomials', 4),
  ('22222222-0000-0000-0000-000000010003', '11111111-0000-0000-0000-000000000001', 3,  'Pair of Linear Equations in Two Variables', 6),
  ('22222222-0000-0000-0000-000000010004', '11111111-0000-0000-0000-000000000001', 4,  'Quadratic Equations', 6),
  ('22222222-0000-0000-0000-000000010005', '11111111-0000-0000-0000-000000000001', 5,  'Arithmetic Progressions', 5),
  ('22222222-0000-0000-0000-000000010006', '11111111-0000-0000-0000-000000000001', 6,  'Triangles', 6),
  ('22222222-0000-0000-0000-000000010007', '11111111-0000-0000-0000-000000000001', 7,  'Coordinate Geometry', 6),
  ('22222222-0000-0000-0000-000000010008', '11111111-0000-0000-0000-000000000001', 8,  'Introduction to Trigonometry', 6),
  ('22222222-0000-0000-0000-000000010009', '11111111-0000-0000-0000-000000000001', 9,  'Some Applications of Trigonometry', 4),
  ('22222222-0000-0000-0000-000000010010', '11111111-0000-0000-0000-000000000001', 10, 'Circles', 5),
  ('22222222-0000-0000-0000-000000010011', '11111111-0000-0000-0000-000000000001', 11, 'Areas Related to Circles', 4),
  ('22222222-0000-0000-0000-000000010012', '11111111-0000-0000-0000-000000000001', 12, 'Surface Areas and Volumes', 6),
  ('22222222-0000-0000-0000-000000010013', '11111111-0000-0000-0000-000000000001', 13, 'Statistics', 6),
  ('22222222-0000-0000-0000-000000010014', '11111111-0000-0000-0000-000000000001', 14, 'Probability', 4)
on conflict (id) do nothing;

-- -------------------------------------------------------------
-- Chapters: Science
-- -------------------------------------------------------------
insert into public.chapters (id, subject_id, chapter_number, name, marks_weightage) values
  ('22222222-0000-0000-0000-000000020001', '11111111-0000-0000-0000-000000000002', 1,  'Chemical Reactions and Equations', 6),
  ('22222222-0000-0000-0000-000000020002', '11111111-0000-0000-0000-000000000002', 2,  'Acids, Bases and Salts', 6),
  ('22222222-0000-0000-0000-000000020003', '11111111-0000-0000-0000-000000000002', 3,  'Metals and Non-metals', 7),
  ('22222222-0000-0000-0000-000000020004', '11111111-0000-0000-0000-000000000002', 4,  'Carbon and its Compounds', 6),
  ('22222222-0000-0000-0000-000000020005', '11111111-0000-0000-0000-000000000002', 5,  'Life Processes', 8),
  ('22222222-0000-0000-0000-000000020006', '11111111-0000-0000-0000-000000000002', 6,  'Control and Coordination', 6),
  ('22222222-0000-0000-0000-000000020007', '11111111-0000-0000-0000-000000000002', 7,  'How do Organisms Reproduce?', 6),
  ('22222222-0000-0000-0000-000000020008', '11111111-0000-0000-0000-000000000002', 8,  'Heredity', 5),
  ('22222222-0000-0000-0000-000000020009', '11111111-0000-0000-0000-000000000002', 9,  'Light - Reflection and Refraction', 7),
  ('22222222-0000-0000-0000-000000020010', '11111111-0000-0000-0000-000000000002', 10, 'The Human Eye and the Colourful World', 5),
  ('22222222-0000-0000-0000-000000020011', '11111111-0000-0000-0000-000000000002', 11, 'Electricity', 8),
  ('22222222-0000-0000-0000-000000020012', '11111111-0000-0000-0000-000000000002', 12, 'Magnetic Effects of Electric Current', 5),
  ('22222222-0000-0000-0000-000000020013', '11111111-0000-0000-0000-000000000002', 13, 'Our Environment', 5)
on conflict (id) do nothing;

-- -------------------------------------------------------------
-- Chapters: Social Science
-- -------------------------------------------------------------
insert into public.chapters (id, subject_id, chapter_number, name, description) values
  ('22222222-0000-0000-0000-000000030001', '11111111-0000-0000-0000-000000000003', 1, 'The Rise of Nationalism in Europe', 'History - India and the Contemporary World II'),
  ('22222222-0000-0000-0000-000000030002', '11111111-0000-0000-0000-000000000003', 2, 'Nationalism in India', 'History - India and the Contemporary World II'),
  ('22222222-0000-0000-0000-000000030003', '11111111-0000-0000-0000-000000000003', 3, 'Resources and Development', 'Geography - Contemporary India II'),
  ('22222222-0000-0000-0000-000000030004', '11111111-0000-0000-0000-000000000003', 4, 'Agriculture', 'Geography - Contemporary India II'),
  ('22222222-0000-0000-0000-000000030005', '11111111-0000-0000-0000-000000000003', 5, 'Power Sharing', 'Political Science - Democratic Politics II'),
  ('22222222-0000-0000-0000-000000030006', '11111111-0000-0000-0000-000000000003', 6, 'Federalism', 'Political Science - Democratic Politics II'),
  ('22222222-0000-0000-0000-000000030007', '11111111-0000-0000-0000-000000000003', 7, 'Development', 'Economics - Understanding Economic Development'),
  ('22222222-0000-0000-0000-000000030008', '11111111-0000-0000-0000-000000000003', 8, 'Sectors of the Indian Economy', 'Economics - Understanding Economic Development')
on conflict (id) do nothing;

-- -------------------------------------------------------------
-- Chapters: English
-- -------------------------------------------------------------
insert into public.chapters (id, subject_id, chapter_number, name, description) values
  ('22222222-0000-0000-0000-000000040001', '11111111-0000-0000-0000-000000000004', 1, 'A Letter to God', 'First Flight - Prose'),
  ('22222222-0000-0000-0000-000000040002', '11111111-0000-0000-0000-000000000004', 2, 'Nelson Mandela: Long Walk to Freedom', 'First Flight - Prose'),
  ('22222222-0000-0000-0000-000000040003', '11111111-0000-0000-0000-000000000004', 3, 'Two Stories about Flying', 'First Flight - Prose'),
  ('22222222-0000-0000-0000-000000040004', '11111111-0000-0000-0000-000000000004', 4, 'From the Diary of Anne Frank', 'First Flight - Prose'),
  ('22222222-0000-0000-0000-000000040005', '11111111-0000-0000-0000-000000000004', 5, 'Glimpses of India', 'First Flight - Prose'),
  ('22222222-0000-0000-0000-000000040006', '11111111-0000-0000-0000-000000000004', 6, 'Grammar and Writing Skills', 'Tenses, modals, subject-verb concord, reported speech, letters and analytical paragraphs')
on conflict (id) do nothing;

-- -------------------------------------------------------------
-- Chapters: Hindi (Course B)
-- -------------------------------------------------------------
insert into public.chapters (id, subject_id, chapter_number, name, description) values
  ('22222222-0000-0000-0000-000000050001', '11111111-0000-0000-0000-000000000005', 1, 'साखी (कबीर)', 'Sparsh - Kavya Khand'),
  ('22222222-0000-0000-0000-000000050002', '11111111-0000-0000-0000-000000000005', 2, 'पद (मीरा)', 'Sparsh - Kavya Khand'),
  ('22222222-0000-0000-0000-000000050003', '11111111-0000-0000-0000-000000000005', 3, 'बड़े भाई साहब', 'Sparsh - Gadya Khand (Premchand)'),
  ('22222222-0000-0000-0000-000000050004', '11111111-0000-0000-0000-000000000005', 4, 'डायरी का एक पन्ना', 'Sparsh - Gadya Khand'),
  ('22222222-0000-0000-0000-000000050005', '11111111-0000-0000-0000-000000000005', 5, 'व्याकरण', 'पदबंध, रचना के आधार पर वाक्य भेद, समास, मुहावरे')
on conflict (id) do nothing;

-- -------------------------------------------------------------
-- Chapters: Computer Applications / IT (Code 402 structure)
-- Part A: Employability Skills (10 marks)  |  Part B: Subject-Specific (40)
-- Part C is assessed via Practical Lab / Project / Viva modules.
-- -------------------------------------------------------------
insert into public.chapters (id, subject_id, chapter_number, name, description, marks_weightage) values
  ('22222222-0000-0000-0000-000000060001', '11111111-0000-0000-0000-000000000006', 1, 'Communication Skills II',   'Part A: Employability Skills', 2),
  ('22222222-0000-0000-0000-000000060002', '11111111-0000-0000-0000-000000000006', 2, 'Self-Management Skills II', 'Part A: Employability Skills', 2),
  ('22222222-0000-0000-0000-000000060003', '11111111-0000-0000-0000-000000000006', 3, 'ICT Skills II',             'Part A: Employability Skills', 2),
  ('22222222-0000-0000-0000-000000060004', '11111111-0000-0000-0000-000000000006', 4, 'Entrepreneurial Skills II', 'Part A: Employability Skills', 2),
  ('22222222-0000-0000-0000-000000060005', '11111111-0000-0000-0000-000000000006', 5, 'Green Skills II',           'Part A: Employability Skills', 2),
  ('22222222-0000-0000-0000-000000060006', '11111111-0000-0000-0000-000000000006', 6, 'Digital Documentation (Advanced)',    'Part B: Subject-Specific Skills - LibreOffice Writer', 10),
  ('22222222-0000-0000-0000-000000060007', '11111111-0000-0000-0000-000000000006', 7, 'Electronic Spreadsheet (Advanced)',   'Part B: Subject-Specific Skills - LibreOffice Calc', 10),
  ('22222222-0000-0000-0000-000000060008', '11111111-0000-0000-0000-000000000006', 8, 'Database Management System',          'Part B: Subject-Specific Skills - LibreOffice Base', 10),
  ('22222222-0000-0000-0000-000000060009', '11111111-0000-0000-0000-000000000006', 9, 'Maintain Healthy, Safe and Secure Working Environment', 'Part B: Subject-Specific Skills', 10)
on conflict (id) do nothing;

-- -------------------------------------------------------------
-- Topics
-- -------------------------------------------------------------
insert into public.topics (id, chapter_id, name, topic_order, difficulty) values
  -- Maths / Real Numbers
  ('33333333-0000-0000-0000-000100010001', '22222222-0000-0000-0000-000000010001', 'The Fundamental Theorem of Arithmetic', 1, 'easy'),
  ('33333333-0000-0000-0000-000100010002', '22222222-0000-0000-0000-000000010001', 'Proving Irrationality of Numbers', 2, 'medium'),
  ('33333333-0000-0000-0000-000100010003', '22222222-0000-0000-0000-000000010001', 'HCF and LCM Applications', 3, 'medium'),
  -- Maths / Quadratic Equations
  ('33333333-0000-0000-0000-000100040001', '22222222-0000-0000-0000-000000010004', 'Standard Form of a Quadratic Equation', 1, 'easy'),
  ('33333333-0000-0000-0000-000100040002', '22222222-0000-0000-0000-000000010004', 'Solution by Factorisation', 2, 'medium'),
  ('33333333-0000-0000-0000-000100040003', '22222222-0000-0000-0000-000000010004', 'Discriminant and Nature of Roots', 3, 'medium'),
  -- Science / Chemical Reactions
  ('33333333-0000-0000-0000-000200010001', '22222222-0000-0000-0000-000000020001', 'Chemical Equations and Balancing', 1, 'easy'),
  ('33333333-0000-0000-0000-000200010002', '22222222-0000-0000-0000-000000020001', 'Types of Chemical Reactions', 2, 'medium'),
  ('33333333-0000-0000-0000-000200010003', '22222222-0000-0000-0000-000000020001', 'Oxidation, Reduction and Effects in Daily Life', 3, 'medium'),
  -- Science / Electricity
  ('33333333-0000-0000-0000-000200110001', '22222222-0000-0000-0000-000000020011', 'Electric Current and Ohm''s Law', 1, 'medium'),
  ('33333333-0000-0000-0000-000200110002', '22222222-0000-0000-0000-000000020011', 'Factors Affecting Resistance', 2, 'medium'),
  ('33333333-0000-0000-0000-000200110003', '22222222-0000-0000-0000-000000020011', 'Series and Parallel Circuits', 3, 'hard'),
  ('33333333-0000-0000-0000-000200110004', '22222222-0000-0000-0000-000000020011', 'Heating Effect and Electric Power', 4, 'medium'),
  -- Social Science / Power Sharing
  ('33333333-0000-0000-0000-000300050001', '22222222-0000-0000-0000-000000030005', 'Belgium and Sri Lanka: Two Case Studies', 1, 'easy'),
  ('33333333-0000-0000-0000-000300050002', '22222222-0000-0000-0000-000000030005', 'Why is Power Sharing Desirable?', 2, 'easy'),
  ('33333333-0000-0000-0000-000300050003', '22222222-0000-0000-0000-000000030005', 'Forms of Power Sharing', 3, 'medium'),
  -- English / A Letter to God
  ('33333333-0000-0000-0000-000400010001', '22222222-0000-0000-0000-000000040001', 'Theme and Summary', 1, 'easy'),
  ('33333333-0000-0000-0000-000400010002', '22222222-0000-0000-0000-000000040001', 'Character Sketch: Lencho and the Postmaster', 2, 'easy'),
  ('33333333-0000-0000-0000-000400010003', '22222222-0000-0000-0000-000000040001', 'Important Questions and Answers', 3, 'medium'),
  -- Hindi / Bade Bhai Sahab
  ('33333333-0000-0000-0000-000500030001', '22222222-0000-0000-0000-000000050003', 'कहानी का सार', 1, 'easy'),
  ('33333333-0000-0000-0000-000500030002', '22222222-0000-0000-0000-000000050003', 'चरित्र-चित्रण', 2, 'medium'),
  -- IT / Digital Documentation
  ('33333333-0000-0000-0000-000600060001', '22222222-0000-0000-0000-000000060006', 'Styles in Writer: Create and Apply', 1, 'easy'),
  ('33333333-0000-0000-0000-000600060002', '22222222-0000-0000-0000-000000060006', 'Table of Contents', 2, 'easy'),
  ('33333333-0000-0000-0000-000600060003', '22222222-0000-0000-0000-000000060006', 'Templates and Document Layout', 3, 'medium'),
  ('33333333-0000-0000-0000-000600060004', '22222222-0000-0000-0000-000000060006', 'Mail Merge', 4, 'medium'),
  -- IT / Electronic Spreadsheet
  ('33333333-0000-0000-0000-000600070001', '22222222-0000-0000-0000-000000060007', 'Consolidating and Linking Data', 1, 'medium'),
  ('33333333-0000-0000-0000-000600070002', '22222222-0000-0000-0000-000000060007', 'Macros in Calc', 2, 'hard'),
  ('33333333-0000-0000-0000-000600070003', '22222222-0000-0000-0000-000000060007', 'Goal Seek and Scenarios', 3, 'medium'),
  ('33333333-0000-0000-0000-000600070004', '22222222-0000-0000-0000-000000060007', 'Sharing and Reviewing Spreadsheets', 4, 'easy'),
  -- IT / DBMS
  ('33333333-0000-0000-0000-000600080001', '22222222-0000-0000-0000-000000060008', 'Database Concepts and RDBMS', 1, 'easy'),
  ('33333333-0000-0000-0000-000600080002', '22222222-0000-0000-0000-000000060008', 'Tables, Keys and Relationships', 2, 'medium'),
  ('33333333-0000-0000-0000-000600080003', '22222222-0000-0000-0000-000000060008', 'SQL Queries (SELECT, INSERT, UPDATE, DELETE)', 3, 'hard'),
  ('33333333-0000-0000-0000-000600080004', '22222222-0000-0000-0000-000000060008', 'Forms and Reports in Base', 4, 'medium')
on conflict (id) do nothing;

-- -------------------------------------------------------------
-- Study contents (samples)
-- -------------------------------------------------------------
insert into public.study_contents (topic_id, simple_explanation, detailed_explanation, key_points, examples, formulae, exam_tips, common_mistakes) values
(
  '33333333-0000-0000-0000-000100010001',
  'Every composite number can be written as a product of prime numbers in only one way (order does not matter). This is called the Fundamental Theorem of Arithmetic.',
  'The Fundamental Theorem of Arithmetic states that every composite number can be expressed (factorised) as a product of primes, and this factorisation is unique, apart from the order in which the prime factors occur. We use this to find HCF and LCM: HCF = product of the smallest power of each common prime factor, LCM = product of the greatest power of each prime factor involved. For any two positive integers a and b, HCF(a,b) x LCM(a,b) = a x b.',
  E'Every composite number has a unique prime factorisation\nHCF = product of smallest powers of common primes\nLCM = product of greatest powers of all primes\nHCF x LCM = product of the two numbers (for two numbers only)',
  E'96 = 2^5 x 3 and 404 = 2^2 x 101, so HCF = 4 and LCM = 9696\nCheck: 4 x 9696 = 96 x 404 = 38784',
  E'HCF(a,b) x LCM(a,b) = a x b',
  'A 1-2 mark question on prime factorisation or the HCF x LCM relation appears almost every year. Show the factor tree clearly.',
  E'Using HCF x LCM = product for THREE numbers (it only works for two)\nForgetting to write the answer with correct powers'
),
(
  '33333333-0000-0000-0000-000100040003',
  'For a quadratic equation ax^2 + bx + c = 0, the number D = b^2 - 4ac is called the discriminant. It tells us how many real roots the equation has without solving it.',
  'The nature of roots of ax^2 + bx + c = 0 (a not equal to 0) depends on the discriminant D = b^2 - 4ac. If D > 0 the equation has two distinct real roots; if D = 0 it has two equal real roots (a repeated root); if D < 0 it has no real roots. When roots exist, x = (-b +/- sqrt(D)) / 2a.',
  E'D = b^2 - 4ac\nD > 0: two distinct real roots\nD = 0: two equal real roots\nD < 0: no real roots',
  E'For 2x^2 - 4x + 3 = 0: D = 16 - 24 = -8 < 0, so no real roots\nFor x^2 - 4x + 4 = 0: D = 0, equal roots x = 2, 2',
  E'D = b^2 - 4ac\nx = (-b +/- sqrt(D)) / 2a',
  'When a question asks "find the value of k for which roots are equal", set D = 0 and solve for k. Always state the condition you are using.',
  E'Sign errors while computing -4ac\nWriting D < 0 as "imaginary roots exist" - in Class 10 say "no real roots"'
),
(
  '33333333-0000-0000-0000-000200010001',
  'A chemical equation is a short way of writing a chemical reaction using symbols and formulae. Balancing means making the number of atoms of each element equal on both sides.',
  'In a chemical reaction, reactants change into products. A chemical equation represents this using formulae, e.g. Zn + H2SO4 -> ZnSO4 + H2. According to the law of conservation of mass, atoms are neither created nor destroyed, so a correct equation must be balanced: the count of every element must match on both sides. We balance by adjusting coefficients (never by changing formulae). Adding state symbols (s), (l), (g), (aq) and conditions above the arrow makes the equation more informative.',
  E'Equations must be balanced (law of conservation of mass)\nBalance with coefficients, never change subscripts\nState symbols: (s) solid, (l) liquid, (g) gas, (aq) aqueous\nConditions (heat, catalyst) are written above the arrow',
  E'Fe + H2O -> Fe3O4 + H2 balances to 3Fe + 4H2O -> Fe3O4 + 4H2\nCH4 + 2O2 -> CO2 + 2H2O',
  '',
  'Practise balancing 8-10 equations from the NCERT exercise; a 2-3 mark balancing question is very common. Always write state symbols if the question asks for a complete equation.',
  E'Changing a formula (like writing H2O2 instead of H2O) to balance - never do this\nForgetting to recount atoms after changing one coefficient'
),
(
  '33333333-0000-0000-0000-000200110001',
  'Electric current is the flow of charge. Ohm''s law says that current through a conductor is directly proportional to the potential difference across it, if temperature stays the same.',
  'Current I = Q/t (charge per unit time), measured in ampere (A). Potential difference V = W/Q, measured in volt (V). Ohm''s law: V = IR, where R is resistance in ohm. The law holds at constant temperature. A V-I graph for an ohmic conductor is a straight line through the origin, and its slope gives resistance. Resistance depends on length, area of cross-section, material and temperature.',
  E'I = Q/t, unit ampere\nV = W/Q, unit volt\nOhm''s law: V = IR at constant temperature\nV-I graph of an ohmic conductor is a straight line through the origin',
  E'If V = 12 V and R = 4 ohm, then I = V/R = 3 A\nA bulb drawing 0.5 A at 220 V has resistance R = 220/0.5 = 440 ohm',
  E'I = Q/t\nV = W/Q\nV = I x R',
  'Numericals from Ohm''s law with unit conversion are frequent 2-3 mark questions. Always write the formula, substitute with units, then compute.',
  E'Mixing up V = IR as I = VR\nForgetting that Ohm''s law is valid only at constant temperature'
),
(
  '33333333-0000-0000-0000-000600060001',
  'A style in LibreOffice Writer is a saved set of formatting (font, size, spacing, colour) that you can apply to text in one click, so the whole document looks consistent.',
  'Styles let you format a document consistently and update formatting everywhere by editing the style once. Writer has paragraph styles, character styles, frame styles, page styles and list styles. Open the Styles deck with F11 (or Styles menu). To create a style: format a paragraph, then drag it into the Styles deck or use New Style from Selection. To apply: select text and double-click the style name. Heading styles (Heading 1, Heading 2 ...) are also what the Table of Contents feature uses.',
  E'Five style types: paragraph, character, frame, page, list\nF11 opens the Styles deck\nNew Style from Selection creates a style from formatted text\nHeading styles power the automatic Table of Contents',
  E'Apply Heading 1 to chapter titles and Heading 2 to section titles, then insert an automatic Table of Contents',
  '',
  'Board practicals often ask you to create a custom style and apply it. Remember the exact menu path: Styles > New Style from Selection.',
  E'Manually formatting each heading instead of using styles\nConfusing character styles (apply to selected text) with paragraph styles (whole paragraph)'
),
(
  '33333333-0000-0000-0000-000600080003',
  'SQL (Structured Query Language) is the language used to store, search and change data in a database. SELECT fetches data, INSERT adds rows, UPDATE changes rows and DELETE removes rows.',
  'SQL commands used in Class 10: CREATE TABLE defines a table with fields and data types; INSERT INTO adds records; SELECT retrieves records, optionally filtered with WHERE and sorted with ORDER BY; UPDATE modifies records matching a condition; DELETE removes records matching a condition. A primary key uniquely identifies each record. Example: SELECT name, marks FROM students WHERE marks > 80 ORDER BY marks DESC;',
  E'SELECT ... FROM ... WHERE ... ORDER BY\nINSERT INTO table VALUES (...)\nUPDATE table SET field = value WHERE condition\nDELETE FROM table WHERE condition\nPrimary key uniquely identifies each record',
  E'SELECT * FROM students;\nSELECT name FROM students WHERE class = 10;\nUPDATE students SET marks = 95 WHERE roll_no = 4;\nDELETE FROM students WHERE roll_no = 7;',
  '',
  'Write SQL keywords in CAPITALS and end statements with a semicolon; examiners look for correct syntax. Always include the WHERE clause in UPDATE/DELETE answers.',
  E'Forgetting WHERE in UPDATE or DELETE (changes every row!)\nUsing = instead of quotes for text values, e.g. name = Amit instead of name = ''Amit'''
)
on conflict (topic_id) do nothing;

-- -------------------------------------------------------------
-- Question bank: 10 per subject
-- Mathematics (44444444-...-000100xx)
-- -------------------------------------------------------------
insert into public.questions (id, subject_id, chapter_id, topic_id, question_type, question_text, options_json, correct_answer, explanation, marks, difficulty) values
('44444444-0000-0000-0000-000000010001', '11111111-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000010001', '33333333-0000-0000-0000-000100010001', 'mcq',
 'The prime factorisation of 156 is:',
 '{"A": "2^2 x 3 x 13", "B": "2 x 3^2 x 13", "C": "2^2 x 3^2 x 13", "D": "2 x 3 x 13"}', 'A',
 '156 = 2 x 78 = 2 x 2 x 39 = 2^2 x 3 x 13.', 1, 'easy'),
('44444444-0000-0000-0000-000000010002', '11111111-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000010001', '33333333-0000-0000-0000-000100010003', 'mcq',
 'If HCF(26, 169) = 13, then LCM(26, 169) is:',
 '{"A": "26", "B": "52", "C": "338", "D": "13"}', 'C',
 'LCM = (26 x 169) / HCF = 4394 / 13 = 338.', 1, 'medium'),
('44444444-0000-0000-0000-000000010003', '11111111-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000010001', '33333333-0000-0000-0000-000100010002', 'short_answer',
 'Prove that root 5 is irrational.',
 null, 'Assume root 5 = p/q with p, q coprime; then 5q^2 = p^2, so 5 divides p; writing p = 5m gives q^2 = 5m^2, so 5 divides q too - contradiction. Hence root 5 is irrational.',
 'Standard proof by contradiction using the theorem: if a prime p divides a^2 then p divides a.', 3, 'medium'),
('44444444-0000-0000-0000-000000010004', '11111111-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000010004', '33333333-0000-0000-0000-000100040003', 'mcq',
 'The discriminant of 3x^2 - 2x + 1/3 = 0 is:',
 '{"A": "4", "B": "0", "C": "-4", "D": "1/3"}', 'B',
 'D = b^2 - 4ac = 4 - 4(3)(1/3) = 4 - 4 = 0.', 1, 'medium'),
('44444444-0000-0000-0000-000000010005', '11111111-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000010004', '33333333-0000-0000-0000-000100040003', 'mcq',
 'If the equation x^2 + kx + 9 = 0 has equal roots, then k equals:',
 '{"A": "3 or -3", "B": "6 or -6", "C": "9 or -9", "D": "0"}', 'B',
 'For equal roots D = 0: k^2 - 36 = 0, so k = 6 or k = -6.', 1, 'medium'),
('44444444-0000-0000-0000-000000010006', '11111111-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000010004', '33333333-0000-0000-0000-000100040002', 'short_answer',
 'Solve by factorisation: x^2 - 7x + 12 = 0.',
 null, 'x^2 - 7x + 12 = (x - 3)(x - 4) = 0, so x = 3 or x = 4.',
 'Split the middle term: -7x = -3x - 4x, then factor by grouping.', 2, 'easy'),
('44444444-0000-0000-0000-000000010007', '11111111-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000010005', null, 'mcq',
 'The 10th term of the AP 2, 7, 12, ... is:',
 '{"A": "45", "B": "47", "C": "52", "D": "42"}', 'B',
 'a = 2, d = 5; a10 = a + 9d = 2 + 45 = 47.', 1, 'easy'),
('44444444-0000-0000-0000-000000010008', '11111111-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000010008', null, 'mcq',
 'If sin A = 3/5, then cos A equals (A is acute):',
 '{"A": "4/5", "B": "3/4", "C": "5/4", "D": "5/3"}', 'A',
 'cos A = sqrt(1 - sin^2 A) = sqrt(1 - 9/25) = 4/5.', 1, 'easy'),
('44444444-0000-0000-0000-000000010009', '11111111-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000010014', null, 'mcq',
 'A die is thrown once. The probability of getting a number greater than 4 is:',
 '{"A": "1/6", "B": "1/3", "C": "1/2", "D": "2/3"}', 'B',
 'Favourable outcomes: 5 and 6, so P = 2/6 = 1/3.', 1, 'easy'),
('44444444-0000-0000-0000-000000010010', '11111111-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000010003', null, 'assertion_reason',
 'Assertion (A): The pair of equations x + 2y = 5 and 2x + 4y = 10 has infinitely many solutions. Reason (R): If a1/a2 = b1/b2 = c1/c2, the pair of linear equations is consistent with infinitely many solutions.',
 '{"A": "Both A and R are true and R is the correct explanation of A", "B": "Both A and R are true but R is not the correct explanation of A", "C": "A is true but R is false", "D": "A is false but R is true"}', 'A',
 'Here 1/2 = 2/4 = 5/10, so the lines coincide; R correctly states the condition.', 1, 'medium')
on conflict (id) do nothing;

-- -------------------------------------------------------------
-- Science questions (44444444-...-000200xx)
-- -------------------------------------------------------------
insert into public.questions (id, subject_id, chapter_id, topic_id, question_type, question_text, options_json, correct_answer, explanation, marks, difficulty) values
('44444444-0000-0000-0000-000000020001', '11111111-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000020001', '33333333-0000-0000-0000-000200010001', 'mcq',
 'The balanced equation for Fe + H2O -> Fe3O4 + H2 requires the coefficients:',
 '{"A": "3, 4, 1, 4", "B": "2, 3, 1, 3", "C": "3, 3, 1, 3", "D": "4, 3, 1, 4"}', 'A',
 '3Fe + 4H2O -> Fe3O4 + 4H2 balances iron, oxygen and hydrogen atoms.', 1, 'medium'),
('44444444-0000-0000-0000-000000020002', '11111111-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000020001', '33333333-0000-0000-0000-000200010002', 'mcq',
 'The reaction CaO + H2O -> Ca(OH)2 is an example of:',
 '{"A": "Decomposition reaction", "B": "Combination reaction", "C": "Displacement reaction", "D": "Double displacement reaction"}', 'B',
 'Two reactants combine to form a single product, so it is a combination reaction (also exothermic).', 1, 'easy'),
('44444444-0000-0000-0000-000000020003', '11111111-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000020001', '33333333-0000-0000-0000-000200010003', 'short_answer',
 'Why does the surface of copper become green when exposed to moist air? Name the compound formed.',
 null, 'Copper reacts slowly with moist air (CO2, O2 and moisture) forming a green coating of basic copper carbonate, CuCO3.Cu(OH)2. This is corrosion of copper.',
 'Corrosion of copper produces green basic copper carbonate.', 2, 'medium'),
('44444444-0000-0000-0000-000000020004', '11111111-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000020002', null, 'mcq',
 'The pH of a neutral solution at 25 degree C is:',
 '{"A": "0", "B": "7", "C": "14", "D": "1"}', 'B',
 'A neutral solution such as pure water has pH 7.', 1, 'easy'),
('44444444-0000-0000-0000-000000020005', '11111111-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000020011', '33333333-0000-0000-0000-000200110001', 'numerical',
 'An electric iron draws a current of 5 A when connected to a 220 V supply. Calculate its resistance.',
 null, '44',
 'R = V/I = 220/5 = 44 ohm.', 2, 'easy'),
('44444444-0000-0000-0000-000000020006', '11111111-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000020011', '33333333-0000-0000-0000-000200110003', 'mcq',
 'Three resistors of 2, 3 and 6 ohm are connected in parallel. The equivalent resistance is:',
 '{"A": "11 ohm", "B": "1 ohm", "C": "6 ohm", "D": "0.5 ohm"}', 'B',
 '1/R = 1/2 + 1/3 + 1/6 = 1, so R = 1 ohm.', 1, 'hard'),
('44444444-0000-0000-0000-000000020007', '11111111-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000020011', '33333333-0000-0000-0000-000200110004', 'numerical',
 'A 100 W bulb operates for 10 hours. How many units (kWh) of electrical energy are consumed?',
 null, '1',
 'Energy = P x t = 0.1 kW x 10 h = 1 kWh = 1 unit.', 2, 'medium'),
('44444444-0000-0000-0000-000000020008', '11111111-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000020009', null, 'mcq',
 'The mirror used as a rear-view mirror in vehicles is:',
 '{"A": "Concave mirror", "B": "Plane mirror", "C": "Convex mirror", "D": "Parabolic mirror"}', 'C',
 'A convex mirror gives an erect, diminished image and a wide field of view.', 1, 'easy'),
('44444444-0000-0000-0000-000000020009', '11111111-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000020005', null, 'true_false',
 'In human beings, the exchange of gases takes place in the alveoli of the lungs.',
 null, 'True',
 'Alveoli provide a large surface area for exchange of oxygen and carbon dioxide.', 1, 'easy'),
('44444444-0000-0000-0000-000000020010', '11111111-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000020001', '33333333-0000-0000-0000-000200010002', 'long_answer',
 'What is a decomposition reaction? Explain thermal decomposition with one example and a balanced equation. Why are decomposition reactions the opposite of combination reactions?',
 null, 'A decomposition reaction is one in which a single compound breaks down into two or more simpler substances. In thermal decomposition, heat breaks the compound, e.g. CaCO3 --heat--> CaO + CO2. It is the opposite of combination because a combination reaction joins two or more reactants into a single product, while decomposition splits one reactant into several products.',
 'Definition (1 mark), correct balanced example with heat condition (1 mark), comparison with combination reaction (1 mark).', 3, 'medium')
on conflict (id) do nothing;

-- -------------------------------------------------------------
-- Social Science questions (44444444-...-000300xx)
-- -------------------------------------------------------------
insert into public.questions (id, subject_id, chapter_id, topic_id, question_type, question_text, options_json, correct_answer, explanation, marks, difficulty) values
('44444444-0000-0000-0000-000000030001', '11111111-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000030005', '33333333-0000-0000-0000-000300050001', 'mcq',
 'Which community was in majority in Belgium''s capital Brussels?',
 '{"A": "Dutch-speaking", "B": "French-speaking", "C": "German-speaking", "D": "English-speaking"}', 'B',
 'In Brussels, 80 percent people spoke French while the country overall had a Dutch-speaking majority.', 1, 'easy'),
('44444444-0000-0000-0000-000000030002', '11111111-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000030005', '33333333-0000-0000-0000-000300050003', 'mcq',
 'Power shared among Legislature, Executive and Judiciary is called:',
 '{"A": "Vertical division of power", "B": "Horizontal division of power", "C": "Community government", "D": "Federal division"}', 'B',
 'Organs of government at the same level checking each other is horizontal distribution (checks and balances).', 1, 'medium'),
('44444444-0000-0000-0000-000000030003', '11111111-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000030005', '33333333-0000-0000-0000-000300050002', 'short_answer',
 'State two prudential reasons why power sharing is desirable.',
 null, '1) It reduces the possibility of conflict between social groups. 2) It ensures political stability, because majority tyranny can destroy the unity of the nation (as seen in Sri Lanka).',
 'Prudential reasons stress beneficial consequences: reduced conflict and stability.', 2, 'easy'),
('44444444-0000-0000-0000-000000030004', '11111111-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000030002', null, 'mcq',
 'The Non-Cooperation Movement was launched by Mahatma Gandhi in:',
 '{"A": "1919", "B": "1920", "C": "1930", "D": "1942"}', 'B',
 'The Non-Cooperation Movement began in January 1921 after being adopted in 1920 (Nagpur session).', 1, 'easy'),
('44444444-0000-0000-0000-000000030005', '11111111-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000030002', null, 'short_answer',
 'Why did Gandhiji decide to withdraw the Non-Cooperation Movement?',
 null, 'Because of the Chauri Chaura incident (February 1922) where a peaceful demonstration turned violent and a police station was set on fire, killing policemen. Gandhiji felt satyagrahis were not ready for non-violent mass struggle.',
 'Chauri Chaura violence convinced Gandhiji to call off the movement.', 2, 'medium'),
('44444444-0000-0000-0000-000000030006', '11111111-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000030003', null, 'mcq',
 'Which type of soil is most widespread in India and is formed by river deposits?',
 '{"A": "Black soil", "B": "Red soil", "C": "Alluvial soil", "D": "Laterite soil"}', 'C',
 'Alluvial soil covers the northern plains and river deltas; it is deposited by rivers.', 1, 'easy'),
('44444444-0000-0000-0000-000000030007', '11111111-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000030004', null, 'mcq',
 'Rabi crops are:',
 '{"A": "Sown in winter and harvested in summer", "B": "Sown in monsoon and harvested in autumn", "C": "Grown throughout the year", "D": "Sown in summer and harvested in winter"}', 'A',
 'Rabi crops (wheat, barley, peas, gram, mustard) are sown from October to December and harvested in summer (April to June).', 1, 'easy'),
('44444444-0000-0000-0000-000000030008', '11111111-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000030007', null, 'mcq',
 'The most common indicator used to compare development of countries by the World Bank is:',
 '{"A": "Literacy rate", "B": "Per capita income", "C": "Life expectancy", "D": "Infant mortality rate"}', 'B',
 'World Development Reports classify countries mainly by per capita income (average income).', 1, 'easy'),
('44444444-0000-0000-0000-000000030009', '11111111-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000030008', null, 'mcq',
 'Activities like banking, transport and communication belong to the:',
 '{"A": "Primary sector", "B": "Secondary sector", "C": "Tertiary sector", "D": "Unorganised sector"}', 'C',
 'The tertiary (service) sector supports the production of goods with services.', 1, 'easy'),
('44444444-0000-0000-0000-000000030010', '11111111-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000030006', null, 'long_answer',
 'Describe any three features of the federal system of government in India.',
 null, '1) There are two (in India, three) levels of government - Union, State and local. 2) Each level has its own jurisdiction defined by the Constitution through the Union, State and Concurrent lists. 3) The Constitution is supreme; changes to its federal provisions need approval of both levels, and courts act as umpires in disputes.',
 'Any three federal features with brief explanation earn full marks.', 3, 'medium')
on conflict (id) do nothing;

-- -------------------------------------------------------------
-- English questions (44444444-...-000400xx)
-- -------------------------------------------------------------
insert into public.questions (id, subject_id, chapter_id, topic_id, question_type, question_text, options_json, correct_answer, explanation, marks, difficulty) values
('44444444-0000-0000-0000-000000040001', '11111111-0000-0000-0000-000000000004', '22222222-0000-0000-0000-000000040001', '33333333-0000-0000-0000-000400010001', 'mcq',
 'In "A Letter to God", Lencho''s crop was destroyed by:',
 '{"A": "A flood", "B": "A hailstorm", "C": "Locusts", "D": "A drought"}', 'B',
 'A hailstorm ruined Lencho''s ripe cornfield, which he compared to a plague of locusts.', 1, 'easy'),
('44444444-0000-0000-0000-000000040002', '11111111-0000-0000-0000-000000000004', '22222222-0000-0000-0000-000000040001', '33333333-0000-0000-0000-000400010002', 'mcq',
 'Why did Lencho get angry after counting the money?',
 '{"A": "The money was fake", "B": "It was less than he had asked for", "C": "The letter was opened", "D": "The postmaster scolded him"}', 'B',
 'He had asked God for 100 pesos but found only 70, and suspected the post office employees had taken the rest.', 1, 'easy'),
('44444444-0000-0000-0000-000000040003', '11111111-0000-0000-0000-000000000004', '22222222-0000-0000-0000-000000040001', '33333333-0000-0000-0000-000400010003', 'short_answer',
 'What does the postmaster''s action of collecting money for Lencho tell us about his character?',
 null, 'The postmaster is kind, generous and sensitive. Though he first laughs at the letter, he respects Lencho''s unshakable faith in God and gives part of his own salary, persuading his employees and friends to contribute so that the faith of a simple man is not broken.',
 'Focus on kindness, generosity and respect for faith, with evidence from the text.', 3, 'medium'),
('44444444-0000-0000-0000-000000040004', '11111111-0000-0000-0000-000000000004', '22222222-0000-0000-0000-000000040002', null, 'mcq',
 'Nelson Mandela took the oath as South Africa''s first Black President in:',
 '{"A": "1990", "B": "1994", "C": "1992", "D": "1996"}', 'B',
 'The inauguration took place on 10 May 1994 after the first democratic elections.', 1, 'easy'),
('44444444-0000-0000-0000-000000040005', '11111111-0000-0000-0000-000000000004', '22222222-0000-0000-0000-000000040002', null, 'short_answer',
 'According to Mandela, what are the "twin obligations" every man has?',
 null, 'Every man has obligations to his family - parents, wife and children - and obligations to his people, his community and his country. In apartheid South Africa, a Black man could rarely fulfil both.',
 'Name both obligations and mention how apartheid made fulfilling them impossible.', 2, 'medium'),
('44444444-0000-0000-0000-000000040006', '11111111-0000-0000-0000-000000000004', '22222222-0000-0000-0000-000000040004', null, 'mcq',
 'Anne Frank called her diary:',
 '{"A": "Betty", "B": "Kitty", "C": "Daisy", "D": "Dolly"}', 'B',
 'Anne named her diary Kitty and wrote letters to it as a friend.', 1, 'easy'),
('44444444-0000-0000-0000-000000040007', '11111111-0000-0000-0000-000000000004', '22222222-0000-0000-0000-000000040006', null, 'fill_blank',
 'Fill in the blank with the correct modal: You ______ carry your admit card to the examination hall. (obligation)',
 null, 'must',
 '"Must" expresses strong obligation or compulsion.', 1, 'easy'),
('44444444-0000-0000-0000-000000040008', '11111111-0000-0000-0000-000000000004', '22222222-0000-0000-0000-000000040006', null, 'mcq',
 'Choose the correct reported speech: She said, "I am reading a novel."',
 '{"A": "She said that she is reading a novel.", "B": "She said that she was reading a novel.", "C": "She says that she was reading a novel.", "D": "She said that she reads a novel."}', 'B',
 'Present continuous in direct speech becomes past continuous in indirect speech when the reporting verb is in the past.', 1, 'medium'),
('44444444-0000-0000-0000-000000040009', '11111111-0000-0000-0000-000000000004', '22222222-0000-0000-0000-000000040006', null, 'fill_blank',
 'Fill in the blank with the correct form: Neither of the boys ______ (was/were) present yesterday.',
 null, 'was',
 '"Neither of" takes a singular verb.', 1, 'medium'),
('44444444-0000-0000-0000-000000040010', '11111111-0000-0000-0000-000000000004', '22222222-0000-0000-0000-000000040003', null, 'long_answer',
 'The pilot in "The Black Aeroplane" says, "I landed and was not sorry to walk away from the old Dakota." Describe the mysterious experience that led to this remark.',
 null, 'Flying from Paris to London at night, the narrator entered huge storm clouds where his compass, radio and fuel were failing. A strange black aeroplane appeared and its pilot guided him wordlessly through the storm to a safe runway. After landing, no other aircraft was seen on radar, leaving the rescue unexplained - so he was relieved yet mystified.',
 'Cover the storm, the failing instruments, the black aeroplane''s guidance and the mystery at the control centre.', 3, 'medium')
on conflict (id) do nothing;

-- -------------------------------------------------------------
-- Hindi questions (44444444-...-000500xx)
-- -------------------------------------------------------------
insert into public.questions (id, subject_id, chapter_id, topic_id, question_type, question_text, options_json, correct_answer, explanation, marks, difficulty) values
('44444444-0000-0000-0000-000000050001', '11111111-0000-0000-0000-000000000005', '22222222-0000-0000-0000-000000050001', null, 'mcq',
 'कबीर के अनुसार सच्चा संत कौन है?',
 '{"A": "जो तीर्थ यात्रा करता है", "B": "जो पक्षपात से दूर रहकर सबके साथ समान व्यवहार करता है", "C": "जो केवल उपवास रखता है", "D": "जो जंगल में रहता है"}', 'B',
 'कबीर के अनुसार सच्चा संत वही है जो पक्षपात रहित होकर निष्पक्ष भाव से रहता है।', 1, 'easy'),
('44444444-0000-0000-0000-000000050002', '11111111-0000-0000-0000-000000000005', '22222222-0000-0000-0000-000000050001', null, 'short_answer',
 '"निंदक नेड़ा राखिए" साखी का भाव स्पष्ट कीजिए।',
 null, 'कबीर कहते हैं कि निंदा करने वाले व्यक्ति को अपने पास रखना चाहिए क्योंकि वह बिना साबुन-पानी के हमारे स्वभाव को निर्मल (साफ) कर देता है। निंदक हमारी कमियाँ बताता है जिससे हम उन्हें सुधार सकते हैं।',
 'निंदक की उपयोगिता - दोष बताकर स्वभाव निर्मल करना।', 2, 'medium'),
('44444444-0000-0000-0000-000000050003', '11111111-0000-0000-0000-000000000005', '22222222-0000-0000-0000-000000050003', '33333333-0000-0000-0000-000500030001', 'mcq',
 '"बड़े भाई साहब" कहानी के लेखक कौन हैं?',
 '{"A": "प्रेमचंद", "B": "जयशंकर प्रसाद", "C": "महादेवी वर्मा", "D": "रामधारी सिंह दिनकर"}', 'A',
 'बड़े भाई साहब कहानी मुंशी प्रेमचंद द्वारा लिखी गई है।', 1, 'easy'),
('44444444-0000-0000-0000-000000050004', '11111111-0000-0000-0000-000000000005', '22222222-0000-0000-0000-000000050003', '33333333-0000-0000-0000-000500030001', 'mcq',
 'बड़े भाई साहब छोटे भाई से उम्र में कितने साल बड़े थे?',
 '{"A": "दो साल", "B": "तीन साल", "C": "पाँच साल", "D": "चार साल"}', 'C',
 'बड़े भाई साहब छोटे भाई से पाँच साल बड़े थे।', 1, 'easy'),
('44444444-0000-0000-0000-000000050005', '11111111-0000-0000-0000-000000000005', '22222222-0000-0000-0000-000000050003', '33333333-0000-0000-0000-000500030002', 'short_answer',
 'बड़े भाई साहब के चरित्र की दो विशेषताएँ लिखिए।',
 null, '1) वे कर्तव्यनिष्ठ और जिम्मेदार हैं - छोटे भाई के मार्गदर्शन को अपना धर्म मानते हैं। 2) वे संयमी और त्यागी हैं - स्वयं खेल-तमाशों से दूर रहकर आदर्श प्रस्तुत करते हैं।',
 'कर्तव्यनिष्ठा, गंभीरता, संयम, बड़प्पन - कोई दो विशेषताएँ।', 2, 'medium'),
('44444444-0000-0000-0000-000000050006', '11111111-0000-0000-0000-000000000005', '22222222-0000-0000-0000-000000050004', null, 'mcq',
 '"डायरी का एक पन्ना" पाठ में 26 जनवरी 1931 को कहाँ झंडा फहराया जाना था?',
 '{"A": "दिल्ली", "B": "कलकत्ता", "C": "मुंबई", "D": "लाहौर"}', 'B',
 'पाठ में कलकत्ता में स्वतंत्रता दिवस मनाने और झंडा फहराने का वर्णन है।', 1, 'medium'),
('44444444-0000-0000-0000-000000050007', '11111111-0000-0000-0000-000000000005', '22222222-0000-0000-0000-000000050005', null, 'mcq',
 '"नीला कमल" में कौन-सा समास है?',
 '{"A": "द्वंद्व समास", "B": "कर्मधारय समास", "C": "तत्पुरुष समास", "D": "बहुव्रीहि समास"}', 'B',
 'विशेषण-विशेष्य संबंध होने से यह कर्मधारय समास है।', 1, 'medium'),
('44444444-0000-0000-0000-000000050008', '11111111-0000-0000-0000-000000000005', '22222222-0000-0000-0000-000000050005', null, 'fill_blank',
 '"आँखों का तारा होना" मुहावरे का अर्थ लिखिए।',
 null, 'बहुत प्यारा होना',
 'आँखों का तारा होना = अत्यंत प्रिय होना।', 1, 'easy'),
('44444444-0000-0000-0000-000000050009', '11111111-0000-0000-0000-000000000005', '22222222-0000-0000-0000-000000050005', null, 'mcq',
 'रचना की दृष्टि से "जब वर्षा होती है, तब मोर नाचता है" वाक्य है:',
 '{"A": "सरल वाक्य", "B": "संयुक्त वाक्य", "C": "मिश्र वाक्य", "D": "विधानवाचक वाक्य"}', 'C',
 'एक प्रधान उपवाक्य और एक आश्रित उपवाक्य होने से यह मिश्र वाक्य है।', 1, 'medium'),
('44444444-0000-0000-0000-000000050010', '11111111-0000-0000-0000-000000000005', '22222222-0000-0000-0000-000000050003', '33333333-0000-0000-0000-000500030001', 'long_answer',
 '"बड़े भाई साहब" कहानी से हमें क्या शिक्षा मिलती है? विस्तार से लिखिए।',
 null, 'कहानी सिखाती है कि किताबी ज्ञान ही सब कुछ नहीं है - जीवन का अनुभव भी उतना ही महत्वपूर्ण है। बड़ों का आदर और उनके अनुभव से सीखना चाहिए। साथ ही शिक्षा रटने की वस्तु नहीं, समझने की वस्तु है। खेल और पढ़ाई में संतुलन आवश्यक है।',
 'अनुभव का महत्व, बड़ों का सम्मान, रटने बनाम समझने पर टिप्पणी - कोई भी तीन बिंदु।', 3, 'medium')
on conflict (id) do nothing;

-- -------------------------------------------------------------
-- Computer Applications / IT questions (44444444-...-000600xx)
-- -------------------------------------------------------------
insert into public.questions (id, subject_id, chapter_id, topic_id, question_type, question_text, options_json, correct_answer, explanation, marks, difficulty) values
('44444444-0000-0000-0000-000000060001', '11111111-0000-0000-0000-000000000006', '22222222-0000-0000-0000-000000060006', '33333333-0000-0000-0000-000600060001', 'mcq',
 'Which function key opens the Styles deck in LibreOffice Writer?',
 '{"A": "F5", "B": "F7", "C": "F11", "D": "F2"}', 'C',
 'F11 (or the Styles menu) opens the Styles deck in Writer.', 1, 'easy'),
('44444444-0000-0000-0000-000000060002', '11111111-0000-0000-0000-000000000006', '22222222-0000-0000-0000-000000060006', '33333333-0000-0000-0000-000600060002', 'mcq',
 'An automatic Table of Contents in Writer is generated from:',
 '{"A": "Bookmarks", "B": "Heading styles", "C": "Footnotes", "D": "Hyperlinks"}', 'B',
 'The TOC is built from paragraphs formatted with Heading styles (Heading 1, 2, 3...).', 1, 'easy'),
('44444444-0000-0000-0000-000000060003', '11111111-0000-0000-0000-000000000006', '22222222-0000-0000-0000-000000060006', '33333333-0000-0000-0000-000600060004', 'short_answer',
 'What is mail merge? Name its three main components.',
 null, 'Mail merge is a feature that combines a main document with a data source to produce many personalised copies (letters, labels, envelopes). Components: 1) Main document, 2) Data source (address list), 3) Merged document.',
 'Definition plus the three components: main document, data source, merged output.', 2, 'easy'),
('44444444-0000-0000-0000-000000060004', '11111111-0000-0000-0000-000000000006', '22222222-0000-0000-0000-000000060007', '33333333-0000-0000-0000-000600070003', 'mcq',
 'Which Calc tool finds the input value needed to reach a specific result in a formula cell?',
 '{"A": "Scenario", "B": "Goal Seek", "C": "Solver", "D": "Consolidate"}', 'B',
 'Goal Seek (Tools > Goal Seek) back-calculates one input for a desired formula result.', 1, 'medium'),
('44444444-0000-0000-0000-000000060005', '11111111-0000-0000-0000-000000000006', '22222222-0000-0000-0000-000000060007', '33333333-0000-0000-0000-000600070001', 'mcq',
 'To refer to cell A1 of sheet "Sales" from another sheet in the same Calc file, you write:',
 '{"A": "Sales!A1", "B": "Sales.A1", "C": "A1.Sales", "D": "[Sales]A1"}', 'B',
 'LibreOffice Calc uses SheetName.CellRef (dot), e.g. =Sales.A1. (Excel uses ! instead).', 1, 'medium'),
('44444444-0000-0000-0000-000000060006', '11111111-0000-0000-0000-000000000006', '22222222-0000-0000-0000-000000060007', '33333333-0000-0000-0000-000600070002', 'true_false',
 'A macro in LibreOffice Calc is a recorded sequence of actions that can be replayed to automate repetitive tasks.',
 null, 'True',
 'Macros (Tools > Macros) record and replay steps, written in LibreOffice Basic.', 1, 'easy'),
('44444444-0000-0000-0000-000000060007', '11111111-0000-0000-0000-000000000006', '22222222-0000-0000-0000-000000060008', '33333333-0000-0000-0000-000600080002', 'mcq',
 'A field (or combination of fields) that uniquely identifies each record in a table is called a:',
 '{"A": "Foreign key", "B": "Primary key", "C": "Candidate field", "D": "Index"}', 'B',
 'The primary key uniquely identifies each record; it cannot be null or duplicate.', 1, 'easy'),
('44444444-0000-0000-0000-000000060008', '11111111-0000-0000-0000-000000000006', '22222222-0000-0000-0000-000000060008', '33333333-0000-0000-0000-000600080003', 'short_answer',
 'Write an SQL query to display the names of all students from the table STUDENT whose marks are more than 75, in decreasing order of marks.',
 null, 'SELECT name FROM STUDENT WHERE marks > 75 ORDER BY marks DESC;',
 'SELECT with WHERE for filtering and ORDER BY ... DESC for decreasing order.', 2, 'medium'),
('44444444-0000-0000-0000-000000060009', '11111111-0000-0000-0000-000000000006', '22222222-0000-0000-0000-000000060003', null, 'mcq',
 'Which of the following is the correct order of steps for creating a strong password?',
 '{"A": "Use only your name", "B": "Use a mix of letters, numbers and symbols with 8+ characters", "C": "Use your date of birth", "D": "Use the word password"}', 'B',
 'Strong passwords are long and mix character types; personal details are easy to guess.', 1, 'easy'),
('44444444-0000-0000-0000-000000060010', '11111111-0000-0000-0000-000000000006', '22222222-0000-0000-0000-000000060009', null, 'viva',
 'What is ergonomics and why is it important when working on a computer?',
 null, 'Ergonomics is the science of designing the workplace and equipment to fit the worker - correct chair height, screen at eye level, wrists straight while typing. It prevents strain injuries, eye fatigue and posture problems, keeping the working environment healthy and safe.',
 'Definition plus at least two practical examples and the health benefit.', 2, 'medium')
on conflict (id) do nothing;

-- -------------------------------------------------------------
-- Mock test 1: FIXED - Science (Chemical Reactions + Electricity)
-- -------------------------------------------------------------
insert into public.mock_tests (id, name, subject_id, chapter_id, test_type, generation_type, duration_minutes, total_marks) values
  ('55555555-0000-0000-0000-000000000001', 'Science Chapter Test: Chemical Reactions and Electricity', '11111111-0000-0000-0000-000000000002', null, 'subject', 'fixed', 30, 15)
on conflict (id) do nothing;

insert into public.mock_test_questions (id, mock_test_id, question_id, question_order, marks) values
  ('55555555-0000-0000-0000-000000000101', '55555555-0000-0000-0000-000000000001', '44444444-0000-0000-0000-000000020001', 1, 1),
  ('55555555-0000-0000-0000-000000000102', '55555555-0000-0000-0000-000000000001', '44444444-0000-0000-0000-000000020002', 2, 1),
  ('55555555-0000-0000-0000-000000000103', '55555555-0000-0000-0000-000000000001', '44444444-0000-0000-0000-000000020004', 3, 1),
  ('55555555-0000-0000-0000-000000000104', '55555555-0000-0000-0000-000000000001', '44444444-0000-0000-0000-000000020005', 4, 2),
  ('55555555-0000-0000-0000-000000000105', '55555555-0000-0000-0000-000000000001', '44444444-0000-0000-0000-000000020006', 5, 1),
  ('55555555-0000-0000-0000-000000000106', '55555555-0000-0000-0000-000000000001', '44444444-0000-0000-0000-000000020007', 6, 2),
  ('55555555-0000-0000-0000-000000000107', '55555555-0000-0000-0000-000000000001', '44444444-0000-0000-0000-000000020008', 7, 1),
  ('55555555-0000-0000-0000-000000000108', '55555555-0000-0000-0000-000000000001', '44444444-0000-0000-0000-000000020009', 8, 1),
  ('55555555-0000-0000-0000-000000000109', '55555555-0000-0000-0000-000000000001', '44444444-0000-0000-0000-000000020003', 9, 2),
  ('55555555-0000-0000-0000-000000000110', '55555555-0000-0000-0000-000000000001', '44444444-0000-0000-0000-000000020010', 10, 3)
on conflict (id) do nothing;

-- -------------------------------------------------------------
-- Mock test 2: RANDOM template - Mathematics quick test
-- -------------------------------------------------------------
insert into public.mock_tests (id, name, subject_id, chapter_id, test_type, generation_type, duration_minutes, total_marks) values
  ('55555555-0000-0000-0000-000000000002', 'Mathematics Quick Random Test', '11111111-0000-0000-0000-000000000001', null, 'quick10', 'random', 20, 10)
on conflict (id) do nothing;

insert into public.mock_test_rules (id, mock_test_id, difficulty_mix_json, question_type_mix_json, question_count, topic_ids_json) values
  ('55555555-0000-0000-0000-000000000201', '55555555-0000-0000-0000-000000000002',
   '{"easy": 40, "medium": 50, "hard": 10}', '{"mcq": 80, "short_answer": 20}', 8, '[]')
on conflict (id) do nothing;

-- -------------------------------------------------------------
-- Previous year paper: Science 2024 (sample subset)
-- -------------------------------------------------------------
insert into public.previous_year_papers (id, subject_id, paper_year, set_number, paper_type, total_marks, duration_minutes, status) values
  ('66666666-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000002', 2024, '1', 'board', 13, 40, 'active')
on conflict (id) do nothing;

insert into public.previous_year_questions (id, paper_id, subject_id, chapter_id, topic_id, question_number, question_text, question_type, options_json, marks, model_answer, marking_points, explanation, difficulty, year) values
('77777777-0000-0000-0000-000000000001', '66666666-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000020001', '33333333-0000-0000-0000-000200010002', 1,
 'Which of the following is a displacement reaction?', 'mcq',
 '{"A": "CaCO3 -> CaO + CO2", "B": "Fe + CuSO4 -> FeSO4 + Cu", "C": "2H2 + O2 -> 2H2O", "D": "AgNO3 + NaCl -> AgCl + NaNO3"}', 1,
 'B', 'Correct option B: 1 mark',
 'Iron displaces copper from copper sulphate solution because iron is more reactive.', 'easy', 2024),
('77777777-0000-0000-0000-000000000002', '66666666-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000020011', '33333333-0000-0000-0000-000200110001', 2,
 'The SI unit of electric current is:', 'mcq',
 '{"A": "volt", "B": "coulomb", "C": "ampere", "D": "ohm"}', 1,
 'C', 'Correct option C: 1 mark',
 'Current I = Q/t is measured in ampere (A).', 'easy', 2024),
('77777777-0000-0000-0000-000000000003', '66666666-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000020001', '33333333-0000-0000-0000-000200010001', 3,
 'Balance the chemical equation: Na + H2O -> NaOH + H2. Also state one observation of this reaction.', 'short_answer', null, 2,
 '2Na + 2H2O -> 2NaOH + H2. Observation: the reaction is vigorous and exothermic; hydrogen gas evolves and may catch fire.',
 E'Correctly balanced equation: 1 mark\nAny valid observation (vigorous/exothermic/H2 evolved): 1 mark',
 'Sodium reacts violently with cold water producing sodium hydroxide and hydrogen.', 'medium', 2024),
('77777777-0000-0000-0000-000000000004', '66666666-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000020011', '33333333-0000-0000-0000-000200110002', 4,
 'List two factors on which the resistance of a cylindrical conductor depends. How does resistance change when the length of the conductor is doubled?', 'short_answer', null, 2,
 'Resistance depends on: length of the conductor and area of cross-section (also material and temperature). R is directly proportional to length, so doubling the length doubles the resistance.',
 E'Any two factors: 1 mark\nEffect of doubling length (R doubles): 1 mark',
 'R = rho x l / A; resistance is proportional to length and inversely proportional to area.', 'medium', 2024),
('77777777-0000-0000-0000-000000000005', '66666666-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000020001', '33333333-0000-0000-0000-000200010003', 5,
 'What is meant by rancidity? Write two methods to prevent it.', 'short_answer', null, 3,
 'Rancidity is the oxidation of fats and oils in food, which spoils its taste and smell. Prevention: 1) adding antioxidants to fatty food, 2) storing food in airtight containers or flushing packets with nitrogen gas (also refrigeration).',
 E'Definition of rancidity as oxidation of fats/oils: 1 mark\nEach correct prevention method: 1 mark each (max 2)',
 'Rancidity is an effect of oxidation reactions in everyday life.', 'medium', 2024),
('77777777-0000-0000-0000-000000000006', '66666666-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000020011', '33333333-0000-0000-0000-000200110003', 6,
 'Two resistors of 4 ohm and 12 ohm are connected (a) in series and (b) in parallel. Calculate the equivalent resistance in each case and state in which case the total current drawn from a 12 V battery is more.', 'long_answer', null, 4,
 '(a) Series: R = 4 + 12 = 16 ohm. (b) Parallel: 1/R = 1/4 + 1/12 = 4/12, so R = 3 ohm. Current: series I = 12/16 = 0.75 A; parallel I = 12/3 = 4 A. The current drawn is more in the parallel combination.',
 E'Series resistance 16 ohm: 1 mark\nParallel resistance 3 ohm: 1 mark\nBoth currents computed: 1 mark\nCorrect conclusion (parallel draws more current): 1 mark',
 'Parallel combination has lower equivalent resistance, so it draws more current from the same source.', 'hard', 2024)
on conflict (id) do nothing;

-- -------------------------------------------------------------
-- Practical tasks (Computer Applications / IT)
-- -------------------------------------------------------------
insert into public.practical_tasks (id, subject_id, title, tool, description, steps, expected_outcome, marks, difficulty) values
('88888888-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000006',
 'Create and apply styles, then insert a Table of Contents', 'writer',
 'Prepare a 3-page report on "Our Environment" in LibreOffice Writer using custom styles and generate an automatic Table of Contents.',
 E'1. Create a new Writer document and type 3 short sections with headings.\n2. Open the Styles deck (F11). Create a paragraph style MyHeading (size 16, bold, blue) using New Style from Selection.\n3. Apply Heading 1 to section titles and MyHeading to the report title.\n4. Place the cursor on page 1 and choose Insert > Table of Contents and Index > Table of Contents, Index or Bibliography.\n5. Untick "Protected against manual changes" only if asked; click OK.\n6. Add a new section, then right-click the TOC and choose Update Index.',
 'A styled document whose Table of Contents lists every heading with correct page numbers, updating automatically.', 10, 'easy'),
('88888888-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000006',
 'Link data across sheets and use Goal Seek', 'calc',
 'Build a marks summary workbook in LibreOffice Calc that links totals from three subject sheets and uses Goal Seek to find the marks needed to reach a target average.',
 E'1. Create sheets Maths, Science and English, each with 5 test scores and a SUM total.\n2. On a Summary sheet, reference each total using =Maths.B7 style links.\n3. Compute the average of the three linked totals with AVERAGE().\n4. Use Tools > Goal Seek on the average cell: set the target value to 90 and the variable cell to the English total.\n5. Note the value Goal Seek suggests and click Yes to accept.\n6. Record a short macro (Tools > Macros > Record Macro) that formats the summary header, then replay it.',
 'Summary sheet updates automatically when a subject sheet changes; Goal Seek shows the required English marks; the macro replays the header formatting.', 10, 'medium'),
('88888888-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000006',
 'Create a student database with a query, form and report', 'base',
 'Design a STUDENT database in LibreOffice Base with a table, an SQL query, a data-entry form and a printable report.',
 E'1. Create a new Base database Students.odb.\n2. In table design, create table STUDENT with fields: roll_no (Integer, primary key), name (Text), class (Text), marks (Integer).\n3. Enter at least 8 records using the table view.\n4. Create a query in SQL view: SELECT name, marks FROM STUDENT WHERE marks > 75 ORDER BY marks DESC;\n5. Use the Form Wizard to build a data-entry form for STUDENT and add one record with it.\n6. Use the Report Wizard to create a report of all students grouped by class.',
 'A working .odb file containing the table with 8+ records, a query returning students above 75 marks, a form that saves data and a formatted report.', 10, 'medium')
on conflict (id) do nothing;

-- -------------------------------------------------------------
-- Viva questions (Computer Applications / IT)
-- -------------------------------------------------------------
insert into public.viva_questions (id, subject_id, chapter_id, question, model_answer, key_points, difficulty) values
('99999999-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000006', '22222222-0000-0000-0000-000000060006',
 'What is the difference between a style and direct formatting in a word processor?',
 'Direct formatting changes only the selected text, one property at a time. A style is a named collection of formatting settings; applying it formats text in one step and editing the style updates every place it is used, keeping the document consistent.',
 E'Style = named, reusable set of formats\nDirect formatting = manual, one-off\nEditing a style updates the whole document', 'easy'),
('99999999-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000006', '22222222-0000-0000-0000-000000060006',
 'Explain the purpose of mail merge with a real-life example.',
 'Mail merge creates many personalised copies of one document by combining a main document with a data source. Example: a school prepares one admit-card letter and merges it with a spreadsheet of student names and roll numbers to print a personalised letter for every student.',
 E'Main document + data source -> merged copies\nSaves time for bulk letters/labels\nOne concrete example', 'easy'),
('99999999-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000006', '22222222-0000-0000-0000-000000060007',
 'What is Goal Seek in a spreadsheet and when would you use it?',
 'Goal Seek is a what-if analysis tool that works backwards: you fix the result you want in a formula cell and Goal Seek finds the input value that produces it. Example: finding how many marks are needed in the last exam to reach a 90 percent average.',
 E'What-if analysis, works backwards from result\nOne variable cell is adjusted\nPractical example given', 'medium'),
('99999999-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000006', '22222222-0000-0000-0000-000000060008',
 'What is a primary key and why does a table need one?',
 'A primary key is a field (or set of fields) whose value uniquely identifies each record in a table; it cannot be null or duplicated. It prevents duplicate records, lets us reliably find and update a specific record, and is used by foreign keys to relate tables.',
 E'Uniquely identifies each record\nNo null, no duplicates\nUsed for relationships between tables', 'medium'),
('99999999-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000006', '22222222-0000-0000-0000-000000060008',
 'Differentiate between the SQL commands DELETE and DROP.',
 'DELETE removes rows (records) from a table - with a WHERE clause it removes only matching rows, and the table structure remains. DROP removes the entire table itself, including its structure and all data, from the database.',
 E'DELETE removes records, table remains\nDROP removes the whole table structure\nDELETE can use WHERE; DROP cannot', 'hard')
on conflict (id) do nothing;

-- -------------------------------------------------------------
-- Project template (Computer Applications / IT)
-- -------------------------------------------------------------
insert into public.project_templates (id, subject_id, title, description, suggested_topics, format_sections) values
('aaaaaaaa-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000006',
 'IT 402 Written Project (10 marks)',
 'Standard CBSE IT project file format. Pick one topic, prepare the document in LibreOffice Writer using styles, and include screenshots of your practical work.',
 E'Student Result Management using LibreOffice Base\nSchool Fee Record using LibreOffice Calc with linked sheets\nMail-merged Event Invitation System in Writer\nDigital Green Skills Awareness Report\nHealthy and Safe Computer Lab Guidelines',
 '[
   {"title": "Cover Page", "guidance": "Project title, student name, class and section, roll number, school name, academic year."},
   {"title": "Certificate", "guidance": "Statement that the project was completed by the student under the teacher''s guidance, with space for signatures."},
   {"title": "Acknowledgement", "guidance": "Thank the subject teacher, school and family briefly (4-5 lines)."},
   {"title": "Index", "guidance": "Auto-generated Table of Contents built from heading styles, with page numbers."},
   {"title": "Introduction", "guidance": "One page describing the topic and why it was chosen."},
   {"title": "Objective", "guidance": "3-5 bullet points stating exactly what the project demonstrates."},
   {"title": "Tools Used", "guidance": "LibreOffice component(s) used with version, and hardware details in one or two lines."},
   {"title": "Steps Followed", "guidance": "Numbered steps of how the work was done - tables, queries, merges or macros created."},
   {"title": "Screenshots", "guidance": "Labelled screenshots of each major step with one-line captions."},
   {"title": "Conclusion", "guidance": "What was learnt, difficulties faced and how they were solved."},
   {"title": "Bibliography", "guidance": "NCERT/CBSE study material, websites and books referred to."}
 ]')
on conflict (id) do nothing;

-- -------------------------------------------------------------
-- Admin settings
-- -------------------------------------------------------------
insert into public.admin_settings (setting_key, setting_value) values
  ('ai_enabled', 'true'),
  ('ai_daily_limit', '20'),
  ('ai_model', 'gemini-2.5-flash')
on conflict (setting_key) do nothing;
