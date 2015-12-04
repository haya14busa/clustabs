import {Student, Person} from './background';

function greeter(person : Person) {
  return "Hello, " + person.firstname + " " + person.lastname;
}

var user = new Student("Jane", "M.", "User");

console.log(greeter(user));
