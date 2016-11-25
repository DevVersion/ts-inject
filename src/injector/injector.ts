import {InjectorKey} from './injector_key';
import {INJECTABLE_META_KEY} from './injector_meta';

export type Constructable<T> = { new(...args: any[]): T; };
export type ProvideToken<T> = Constructable<T>;

export type ProvideValue<T> = {
  provide: ProvideToken<T>,
  useClass?: Constructable<any>,
  useValue?: any
};

export type Token<T> = ProvideValue<T> | ProvideToken<T>;

/**
 * Injector class
 */
export class Injector {

  private keyIds: number[] = [];
  private objects = new Map<number, any>();

  constructor(public declarations?: Token<any>[]) {

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

  has(token: ProvideToken<any>): boolean {
    return this.keyIds.indexOf(InjectorKey.get(token).id) !== -1;
  }

  get<T>(token: ProvideToken<T>): T {
    let injectorKey = InjectorKey.get(token);
    let injectorId = injectorKey.id;

    if (!this.has(token)) {
      throw `Error: Injector could not find token ${injectorKey.displayName}`;
    }

    if (this.objects.has(injectorId)) {
      return this.objects.get(injectorId);
    } else {
      let instance = this.instantiate(token as Constructable<T>);

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

  private _getProvideToken(token: Token<any>): ProvideToken<any> {
    return this._isProvideValue(token) ? (token as ProvideValue<any>).provide :
                                          token as ProvideToken<any>;
  }

  private _isProvideValue(token: Token<any>): boolean {
    return token.hasOwnProperty('provide');
  }

  private _registerDeclaration(token: Token<any>) {

    let provideToken = this._getProvideToken(token);
    let isProvideValue = this._isProvideValue(token);

    if (!isProvideValue) {
      this._validateConstructable(provideToken as Constructable<any>);
    }

    let injectorId = InjectorKey.get(provideToken).id;

    if (isProvideValue) {
      let provideValue = token as ProvideValue<any>;

      // TODO(devversion): SORT by dependencies etc.
      if (provideValue.useClass) {
        this._validateConstructable(provideValue.useClass);
        this.objects.set(injectorId, this.instantiate(provideValue.useClass));
      } else {
        this.objects.set(injectorId, provideValue.useValue);
      }

    }

    this.keyIds.push(injectorId);
  }

  private _validateConstructable(token: Constructable<any>): void {
    if (!Reflect.hasMetadata(INJECTABLE_META_KEY, token)) {
      throw `Error: Injector declaration ${token.name} is not a registered injectable.`;
    }
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