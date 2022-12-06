import React from 'react';

function classDecorator<T extends {new(...args:any[]):{}}>(constructor:T) {
  return class extends constructor {
      newProperty = "new property";
      hello = "override";
  }
}

@classDecorator
export class Greeter {
  property = "property";
  hello: string;
  constructor(m: string) {
      this.hello = m;
  }
}

export const value = <h1></h1>;

