# ts-inject
TypeScript Dependency Injector

### Usage

*Basic Usage*

```ts
import {Injector, Injectable} from 'ts-inject';

@Injectable()
export class MyService {}

let injector = new Injector([
  MyService
]);

injector.get(MyService); // Instance
injector.has(MyService); // True
```

*Decorator Usage*

```ts
import {Injector, Injectable} from 'ts-inject';

@Injectable()
export class ChildService { 
  sayHello() {
    console.log("Hello");
  }
}

@Injectable()
export class MyService {
  constructor(child: ChildService) {
    child.sayHello();
  }
}

let injector = new Injector([
  MyService
]);

// Load the MyService class
injector.get(MyService);

```
