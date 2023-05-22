const inquirer = require("inquirer");
const connection = require("./config/connection");
const cTable = require("console.table");
const mysql = require("mysql2");

connection.connect((error) => {
  if (error) throw error;
  console.log(
    `====================================================================================`
  );
  console.log(``);
  console.log(` 
   _______                   __                                  _____          __           __                         
  |    ___|.--------..-----.|  |.-----..--.--..-----..-----.    |       .---.-.|  |_ .---.-.|  |--..---.-..-----..-----.
  |    ___||        ||  _  ||  ||  _  ||  |  ||  -__||  -__|    |  --  ||  _  ||   _||  _  ||  _  ||  _  ||__ --||  -__|
  |_______||__|__|__||   __||__||_____||___  ||_____||_____|    |_____/ |___._||____||___._||_____||___._||_____||_____|
                     |__|              |_____|                                                                          `);
  console.log(``);
  console.log(
    `                                                          ` +
      "Created By: Andres Rodriguez"
  );
  console.log(``);
  console.log(
    `====================================================================================`
  );
  promptUser();
});

const promptUser = () => {
  inquirer
    .prompt([
      {
        name: "choices",
        type: "list",
        message: "Please select an option:",
        choices: [
          "View All Employees",
          "Add Employee",
          "View All Departments",
          "Add Department",
          "View All Roles",
          "Add Role",
          "Update Employee Role",
          "Exit",
        ],
      },
    ])
    .then((answers) => {
      const { choices } = answers;

      if (choices === "View All Departments") {
        viewAllDepartments();
      }

      if (choices === "View All Roles") {
        viewAllRoles();
      }

      if (choices === "View All Employees") {
        viewAllEmployees();
      }
      if (choices === "Add Employee") {
        addEmployee();
      }
      if (choices === "Add Role") {
        getDepts();
      }
      if (choices === "Add Department") {
        addDepartment();
      }
      if (choices === "Update Employee Role") {
        updateEmployeeRole();
      }

      if (choices === "Exit") {
        connection.end();
      }
    });
};

const viewAllEmployees = () => {
  let sql = `SELECT employee.id, 
  employee.first_name, 
  employee.last_name, 
  role.title, 
  department.name AS 'department', 
  role.salary,
  CONCAT(manager.first_name, ' ', manager.last_name) AS 'manager_name'
  FROM employee
  INNER JOIN role ON role.id = employee.role_id
  INNER JOIN department ON department.id = role.department_id
  LEFT JOIN employee AS manager ON manager.id = employee.manager_id
  ORDER BY employee.id ASC`;

  connection.query(sql, (error, response) => {
    if (error) throw error;
    console.log(
      `====================================================================================`
    );
    console.log(`                              ` + `Employees:`);
    console.log(
      `====================================================================================`
    );
    console.table(response);
    console.log(
      `====================================================================================`
    );
    promptUser();
  });
};

const viewAllRoles = () => {
  console.log(
    `====================================================================================`
  );
  console.log(`                              ` + `Roles:`);
  console.log(
    `====================================================================================`
  );
  const sql = `SELECT role.id, role.title, department.name AS department
                  FROM role
                  INNER JOIN department ON role.department_id = department.id`;
  connection.query(sql, (error, response) => {
    if (error) throw error;
    response.forEach((role) => {
      console.log(role.title);
    });
    console.log(
      `====================================================================================`
    );
    promptUser();
  });
};

const viewAllDepartments = () => {
  const sql = `SELECT department.id AS id, department.name AS department FROM department`;
  connection.query(sql, (error, response) => {
    if (error) throw error;
    `====================================================================================`;
    console.log(`                              ` + `Departments:`);
    console.log(
      `====================================================================================`
    );
    console.table(response);
    console.log(
      `====================================================================================`
    );
    promptUser();
  });
};

const addEmployee = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "firstName",
        message: "What is the new employee's first name?",
        validate: (addFirstName) => {
          if (addFirstName) {
            return true;
          } else {
            console.log("Please enter the new employees first name");
            return false;
          }
        },
      },
      {
        type: "input",
        name: "lastName",
        message: "What is the employee's last name?",
        validate: (addLastName) => {
          if (addLastName) {
            return true;
          } else {
            console.log("Please enter the new employees last name");
            return false;
          }
        },
      },
    ])
    .then((answer) => {
      const responses = [answer.firstName, answer.lastName];
      const roleSql = `SELECT role.id, role.title FROM role`;
      connection.query(roleSql, (error, data) => {
        if (error) throw error;
        const roles = data.map(({ id, title }) => ({ name: title, value: id }));
        inquirer
          .prompt([
            {
              type: "list",
              name: "role",
              message: "What is the new employee's role?",
              choices: roles,
            },
          ])
          .then((roleChoice) => {
            const role = roleChoice.role;
            responses.push(role);
            const managerData = `SELECT * FROM employee`;
            connection.query(managerData, (error, data) => {
              if (error) throw error;
              const managers = data.map(({ id, first_name, last_name }) => ({
                name: first_name + " " + last_name,
                value: id,
              }));
              inquirer
                .prompt([
                  {
                    type: "list",
                    name: "manager",
                    message: "Who is the employee's manager?",
                    choices: managers,
                  },
                ])
                .then((managerChoice) => {
                  const manager = managerChoice.manager;
                  responses.push(manager);
                  const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                                  VALUES ( ?, ?, ?, ?)`;
                  connection.query(sql, responses, (error) => {
                    if (error) throw error;
                    console.log("New Employee has been added");
                    viewAllEmployees();
                  });
                });
            });
          });
      });
    });
};

const getDepts = () => {
  const sql = "SELECT d.id, d.name FROM department d";
  connection.query(sql, (error, departments) => {
    if (error) throw error;

    const deptNames = departments.map((department) => department.name);

    inquirer
      .prompt([
        {
          name: "departmentName",
          type: "list",
          message: "Which department does this new role belong to?",
          choices: deptNames,
        },
      ])
      .then((answer) => {
        const sql = "SELECT id FROM department WHERE name = ?";
        connection.query(sql, [answer.departmentName], (error, result) => {
          if (error) throw error;
          addRole(result[0].id);
        });
      });
  });

  const addRole = (departmentId) => {
    inquirer
      .prompt([
        {
          name: "newRole",
          type: "input",
          message: "What is the title of the new role?",
        },
        {
          name: "salary",
          type: "input",
          message: "What is the salary for this new role?",
        },
      ])
      .then((answer) => {
        const sql =
          "INSERT INTO role (title, salary, department_id) VALUES ( ?, ?, ?)";
        const params = [answer.newRole, answer.salary, departmentId];
        connection.query(sql, params, (error) => {
          if (error) throw error;
          console.log(
            "===================================================================================="
          );
          console.log("Role successfully created");
          console.log(
            "===================================================================================="
          );
          viewAllRoles();
        });
      });
  };
};

const addDepartment = () => {
  inquirer
    .prompt([
      {
        name: "newDepartment",
        type: "input",
        message: "What is the name of the new Department?",
      },
    ])
    .then((answer) => {
      let sql = `INSERT INTO department (name) VALUES (?)`;
      connection.query(sql, answer.newDepartment, (error, response) => {
        if (error) throw error;
        console.log(``);
        console.log(answer.newDepartment + ` Department successfully created`);
        console.log(``);
        viewAllDepartments();
      });
    });
};

const updateEmployeeRole = () => {
  let sql = `
    SELECT employee.id, employee.first_name, employee.last_name, role.id AS "role_id"
    FROM employee, role, department
    WHERE department.id = role.department_id AND role.id = employee.role_id`;

  connection.query(sql, (error, response) => {
    if (error) throw error;

    let employeeNames = response.map(
      (employee) => `${employee.first_name} ${employee.last_name}`
    );

    let roleSql = `SELECT role.id, role.title FROM role`;
    connection.query(roleSql, (error, roleResponse) => {
      if (error) throw error;

      let roles = roleResponse.map((role) => role.title);

      inquirer
        .prompt([
          {
            name: "employee",
            type: "list",
            message: "Which employee has a new role?",
            choices: employeeNames,
          },
          {
            name: "role",
            type: "list",
            message: "What is their new role?",
            choices: roles,
          },
        ])
        .then((answer) => {
          let newRoleId = roleResponse.find(
            (role) => role.title === answer.role
          ).id;
          let employeeId = response.find(
            (employee) =>
              `${employee.first_name} ${employee.last_name}` === answer.employee
          ).id;

          let updateSql = `UPDATE employee SET role_id = ? WHERE id = ?`;
          connection.query(updateSql, [newRoleId, employeeId], (error) => {
            if (error) throw error;
            console.log(
              `====================================================================================`
            );
            console.log("Employee Role Updated");
            console.log(
              `====================================================================================`
            );
            promptUser();
          });
        });
    });
  });
};
