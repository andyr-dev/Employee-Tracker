INSERT INTO department (id, name)
VALUES 
(1, 'IT'),
(2, 'Finance'),
(3, 'Sales'),
(4, 'Service');

INSERT INTO role (id, title, salary, department_id)
VALUES 
(1, 'IT Manager', 110000.00, 1),
(2, 'IT Administrator', 85000.00, 1),
(3, 'Finance Manager', 115000.00, 2),
(4, 'Accountant', 80000.00, 2),
(5, 'Sales Manager', 145000, 3),
(6, 'Sales Person', 90000.00, 3),
(7, 'Service Manager', 110000, 4),
(8, 'Customer Service Rep', 60000.00, 4);

INSERT INTO employee (id, first_name, last_name, role_id, manager_id)
VALUES
(1, 'Andy', 'Rodriguez', 1, NULL),
(2, 'Rachel', 'Rodriguez', 3, NULL),
(3, 'Michael', 'Roland', 5, NULL),
(4, 'Justin', 'Hurtado', 7, NULL),
(5, 'John', 'Smith', 2, 1),
(6, 'Steve', 'Johnson', 4, 2),
(7, 'Stacy', 'Jackson', 6, 3),
(8, 'Christopher', 'Hurtado', 8, 4);
