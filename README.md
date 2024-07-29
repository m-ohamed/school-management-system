# School Management System

A simple school management system.

## Features

* User authentication and authorization
* Validation and error handling for all API endpoints
* MongoDB database for storing and retrieving data
* Swagger documentation for API endpoints

## Getting Started

### Installation

1. Clone the repository: `git clone https://github.com/m-ohamed/school-management-system.git`
2. Open the folder with the cloned content.
3. Install dependencies: `npm i`
4. Start the application: `npm run start`

## Usage

The application provides the following endpoints:

* Authentication:
    + POST /user/login
* Administration Management:
    + POST /admin/createAdmin
* Students Management:
    + POST /student/createStudent
    + GET /student/getStudent/{studentId}
    + GET /student/getStudentsByClassroomId/{classroomId}
    + PATCH /student/updateStudent/{studentId}
    + DELETE /student/deleteStudent/{studentId}
* Schools Management:
    + POST /school/createSchool
    + GET /school/getSchool/{schoolId}
    + PATCH /school/updateSchool/{schoolId}
    + DELETE /school/deleteSchool/{schoolId}
* Classrooms Management:
    + POST /classroom/createClassroom
    + GET /classroom/getClassroom/{classroomId}
    + GET /classroom/getAllClassroomsBySchoolId/{schoolId}
    + PATCH /classroom/updateClassroom/{classroomId}
    + DELETE /classroom/deleteClassroom/{classroomId}

## Deployment

The application is deployed [here](https://advanced-starfish-school-management-system-d42d6dc1.koyeb.app)

## API Documentation

API documentation can be found [here](https://advanced-starfish-school-management-system-d42d6dc1.koyeb.app/api-docs)

## Credentials for demo
* Superadmin:
  + Email: superadmin@testemail.com
  + Password: 1234567890
* Admin: 
  + Email: admin@testemail.com
  + Password: 1234567890