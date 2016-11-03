import {InjectorKey} from './injector_key';
import {INJECTABLE_META_KEY} from './injector_meta';

export type Constructable<T> = { new(...args: any[]): T; };

export class Injector {

  private keyIds: number[] = [];
  private objects = new Map<number, any>();

  constructor(public declarations?: Constructable<any>[]) {

    if (!Reflect) {
      throw 'Error: Injector could not find Reflect';
    }

    /* Register initial declarations from constructor. */
    if (declarations) {
      declarations.forEach(token => this._registerDeclaration(token));
    }

    // Manually expose the injector instance to the own injector.
    this.keyIds.push(InjectorKey.get(Injector).id);

  }

  has(token: Constructable<any>): boolean {
    return this.keyIds.indexOf(InjectorKey.get(token).id) !== -1;
  }

  get<T>(token: Constructable<T>): T {
    let injectorKey = InjectorKey.get(token);
    let injectorId = injectorKey.id;

    if (!this.has(token)) {
      throw `Error: Injector could not find token ${injectorKey.displayName}`;
    }

    if (this.objects.has(injectorId)) {
      return this.objects.get(injectorId);
    } else {
      let instance = this.instantiate(injectorKey.token);

      this.objects.set(injectorId, instance);

      return instance;
    }
  }

  instantiate<T>(type: Constructable<T>): T {
    let paramTypes: any[] = Reflect.getMetadata('design:paramtypes', type);
    let dependencies: any[] = [];

    if (paramTypes) {
      dependencies = this._resolveDependencies(paramTypes);

      if (!dependencies) {
        throw `Error: Injector could not resolve all dependencies of ${type.name}`;
      }
    }

    return new type(...dependencies);
  }

  private _registerDeclaration(token: Constructable<any>) {
    if (!Reflect.hasMetadata(INJECTABLE_META_KEY, token)) {
      throw `Error: Injector declaration ${token.name} is not a registered injectable.`;
    }

    this.keyIds.push(InjectorKey.get(token).id);
  }

  private _resolveDependencies(paramTypes: any[]): any[] {
    let dependencies = paramTypes
      .filter(param => this.has(param))
      .map(param => this.get(param));

    if (dependencies.length !== paramTypes.length) {
      return null;
    }

    return dependencies;
  }

}