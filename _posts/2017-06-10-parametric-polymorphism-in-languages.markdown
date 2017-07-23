---
title: What is Parametric Polymorphism?
date: 2017-06-10 00:00:00 Z
subtitle: A Comparison Across Rust, C++, and Swift
layout: post
comments: true
author: Alan
---

__Parametric polymorphism__ is one of the key programming paradigms that I've realized is
in every expressive, yet powerful programming languages. It is the ability for a language to be able to create data types and structures such that they are able to handle data generically. This enables type safety, as well as programmers not needing to worry about type coercion.

As a beginner to type systems and generic programming, I've come to realize the importance of polymorphism, especially in object-oriented programming. Not only do they enable you to write flexible code and save time doing so, but also be able to compile and debug more efficiently as well. What is also great about parametric polymorphism is the ability to reproduce type-safe code, while also maintaining portability and not having to duplicate code.

Parametric polymorphism are often expressed through __generics__ and __templates__. Keep in mind that we are referring to __parametric__ polymorphism, whereas polymorphism alone deals with the property of classes in object-oriented languages.

We will be examining such features discussed within three languages: Rust, C++, and Swift.

But why?

* Understand how programming language design operates and understand their style and the purposes behind such design, and how it implements in large-scale services, especially web and application design.

---

## Swift

Swift is a high-level language, and therefore programming paradigms such as generics are often tossed under the table due to the high level of abstraction. In Swift, generics are already implemented under a wide variety of data structures, such as dictionaries. Swift's type inference ensures that no explicit declarations are needed.

    let letters = ["A": "Apple", "B:", "Banana", "C:", "Car"]

However, that doesn't really satisfy us. We want to see this action as a powerful feature, not just a commodity within the standard library. Explicit generic declarations are made through the '<' and `>` syntax, and can be declared over a wide variety of structures. Sounds familiar, Rust programmers? I will look at that later.

    // Parametric Polymorphism in functions
    func output<MyType>(a: MyType){
      print(output)
    }
    output(1) // using a numerical Int
    output("dis a string") // using a String
    
    // Parametric Polymorphism within Classes
    class ShoppingList<ShoppingType> {
      var list = [ShoppingType]()
      
      mutating func add(item: ShoppingType) {
        list.append(item)
      }
    }
    
    var Keyfood = ShoppingList<String>()
    Keyfood.add("A new item")
    var FoodUniverse = ShoppingList<Int>()
    FoodUniverse.add(12)

One great feature that can be observed within Swift is the idea of being able to overload generics, or in my words, creating _smart_ generics. 

    func doThis(t: Int) -> Int {
      print("t with a regular ol' method")
      return t
    }
    
    func doThis<T>(t: T) -> T {
      print("t that is SMARTTTTT")
      return t
    }
    
    print(doThis(3)) // "t with a regular ol' method", => 3
    print(doThis(3.0)) // "t that is SMARTTTTT", => 3.0

---

## C++ 

In C++, __templates__ are considered the foundation for generic programming. Templates are extensible to functions and classes.

    // Simple function template
     template<typename T>
     T multiply(T a, T b) {
       return a * b;
     }

One of the only problems that concern C++ is the fact that type inference is not implemented. Therefore, utilizing the above template wouldn't deem functional if do not explicitly provide a cast when passing arguments of different types. Do be warned that types are checked at compile-time, and that the process of operating and type-checking can be incredibly excruciating. Therefore, implementing C++ templates require a level of delicacy and understanding.

    #include <iostream>
    #include <string>
    
    ...
    int main(){
      std::cout << multiply(4, 5) << std::endl; // implicit cast to int, returns 20
      std::cout << multiple<double>(3.0, 4.0) << std::endl; // explicit cast to double, returns 12.0
      std::cout << multiple(2.0, 1) << std::endl; // no explicit cast, different types implemented 
    }

However, C++ still implements templates powerfully within both the Standard Template Library and the Boost Libraries. One great example is utilizing `std::vector` over a standard array.

    #include <vector>
    
    ...
    size_t size = 10;
    std::vector<int> array(size);
  
---

## Rust 

Like Swift, Rust utilizes `<` and `>` for generic syntax. Through Rust's type-safety system, type specification is immediately checked, when called, unlike C++, which does it at compile-time.

Generics can be implemented for functions, structs, enums and `impl` blocks that are associated to its struct or enum. Here is an example of how generics can be implemented.

    struct Player<T> {
      health: T,
      coins: T,
      stamina: T,
    }
    
    impl<T> Player<T> {
      fn output(&mut self) {
          println!("Stats: \n Health: {:?}, Coins: {:?}, Stamina: {:?}", health, coins, stamina);
      }
    } 

    
    fn main(){
      let Player1 = Point { health: 32, coins: 10, stamina: 5};
    }


One great Gist that I found explained this concept quite well with simple to understand code.
[Here is the link](https://gist.github.com/brendanzab/9220415). I will be using the code from the Gist and annotating it.

    template <typename T>
    T fact(T n) {
      return n == T(0) ? T(1) : fact(n - T(1)) * n;
    }

    int main() {
      auto x = fact("hi");
    }

This will obviously return an error. Working with calculations on a `string` type is a no-no.
What is intriguing is the stack trace that is returned:

    Untitled 3.cpp:3:46: error: invalid operands to binary expression ('long' and 'const char *')
    return n == T(0) ? T(1) : fact(n - T(1)) * n;
                              ~~~~~~~~~~~~~~ ^ ~
    Untitled 3.cpp:7:14: note: in instantiation of function template specialization 'fact<const char *>' requested here
    auto x = fact("hi");
             ^
    1 error generated.

Looking at the output, it seems that the error is taking place within the `fact()` template function. This goes back to my previous convictions surrounding parametric polymorphism in C++: __type-safety and implementation is checked during compile-time__.

This of course is also erroneous on Rust. 

    use std::num::{One, one, Zero, zero};

    fn fact<T: Eq + Zero + One + Mul<T, T> + Sub<T, T>>(n: T) -> T {
      if n == zero() { one() } else { fact(n - one()) * n }
    }

    fn main() {
      println!("{}", fact("hi"));
    }

However, where does the error occur?

    Untitled 6.rs:8:20: 8:24 error: failed to find an implementation of trait std::num::Zero for &'static str
    Untitled 6.rs:8     println!("{}", fact("hi"));
                                       ^~~~
    note: in expansion of format_args!
    <std macros>:2:23: 2:77 note: expansion site
    <std macros>:1:1: 1:1 note: in expansion of println!
    Untitled 6.rs:8:5: 8:32 note: expansion site

Once again, we see the strictness of Rust's type system. On call, once we attempt to pass a type that cannot implement the required interface, then we simply cannot work with the associated function.

Of course, if you have been using Rust for a while, it's always essential to look at __traits__. __Traits__ are features in Rust's that enable the programmer to specify the how types should work and how they should be implemented with code. Looking back 
at our earlier code, we have seen how useful `impl` blocks have been for extending structures such as `structs`. In fact, you have already seen trait bounds be implemented on such structures, in the form the syntax `<T>`. But let's explicitly look at `trait` type declarations.

    trait Mathematical {
      fn multiply(&self) -> f64;
    }
    
    struct Expression {
      a: f64,
      b: f64,
    }
    
    impl Mathematical for Expression {
      fn multiply(&self) -> f64 {
        self.a * self.b
      }
      
    }
    
    fn check_my_math<T: Mathematical>(expression: T) {
        println!("This expression has a product of {}", expression.multiply());
    }  
    
    fn main() {
      let a = Expression {
          a: 1f64,
          b: 2f64,
      };
      
      check_my_math(a);

    }

Hmmm... Interesting, correct? Definitely not something you see in C/C++. Actually you do. In this example, we see this syntax `impl Mathematical for Expression`. We are 
actually extending the usage of the trait through inheritance. Of course, the rest of
the code seems familiar, if not guessable. Notice the function with generic bounds passed: `check_my_math<T: Mathematical>(expression: T)`.

__UPDATE:__ Over time, I have gotten very familiar with the Rust programming environment and ecosystem, and I plan to dedicate a post just to look at the inventive ways that we can utilize the standard library to make crafty code. Stay tuned for that!

---

I guess that is it for this post. I've been working quite a bit with type theory for a while now, as I am pretty interested in learning more about languages. I tend to blog about subject matters I'm not really familiar with, as it motivates me to pursue more research, compile more code, and really get to understand software.

Any suggestions? Email me at ex0dus@codemuch.tech. 