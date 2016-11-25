import 'reflect-metadata';
import {Injector} from './index';
import {Injectable} from './injector/injector_meta';

@Injectable()
class Dep {

}

@Injectable()
class Test {

  constructor(dep: Dep) {}

  sayHello(): void {
    console.log("Hello!");
  }

}

@Injectable()
class Mock {

  // constructor(dep: Dep) {}

  sayHello(): void {
    console.log("Mock");
  }

}


var injector = new Injector([
  Test,
  {provide: Test, useClass: Mock },
  Dep,

]);

injector.get(Test).sayHello();