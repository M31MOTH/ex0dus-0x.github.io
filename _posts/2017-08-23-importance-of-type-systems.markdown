---
title: The Importance of Strong Type Systems
date: 2017-08-23 00:00:00 Z
layout: post
---

Recently, I saw [this Computerphile video](https://www.youtube.com/watch?v=-csXdj4WVwA) about the comparison between HTML and C. Professor Brailsford, mentions that HTML is more _tolerant_ than C, where mistakes and poor coding styles are still accepted by the web browser. No explicit exceptions, no warning messages, - and better yet - no segfaults or buffer overruns.

This video got me thinking, "this comparison is unfair. HTML is only a _markup_ language, __NOT__ an actual Turing-complete programming language". But still, it inspired me to get back into something that I really liked in programming language design - type systems. __Type systems__ are rules that programming language developers implement that define the behavior and ways types work, and what structures and components formalize the creation of such types. Computer programmers often classify a programming language's type system as _strong_ or _weak_. If you have been programming for a while, this may be self-explanatory. Ruby is _weakly-typed_. C++ is _strongly-typed_. Some programming languages have the option of being both, such as Go.

    var_one := 4 // this will work
    var_two uint32 := 5 // this will also work

As you can tell, weakly-typed programming languages are often classified through the absence of explicit types and properties of type coercion, often relying on _implicit type conversion_. This is great for high-level programming languages. On the other hand, strongly-typed programming languages utilize explicit types. Great for systems-level design, where you only need 8 bits of unsigned data stored for a program counter or register (hence, the `uint8` type).

While the presence of an explicit or implicit type is not enough to truly define a strong or weak type system, we can also classify them through their implementation of function parameters, error-checking systems and type definition methods. Let's take a look at the two famous ends of the type system spectrum: C and Python.

## C 

C, of course, is __explicitly typed__. This of course, also means that C is statically-typed, and during compilation, all types are checked for consistency such that there are no unchecked runtime type errors. C also implements `typedef` and '#define' macros, where you can create aliases for your types.

    #include <stdio.h>
    #include <stdlib.h>

    typedef i32 uint32;

    i32 test_func( i32 one, i32 two ){
      return one * two;
    }

    int main(void){
      i32 one = 4;
      i32 two = "five"; // => error!
      
      i32 three = test_func(one, two); // definitely won't execute.
      printf("%d", three);
    }

This, of course, won't compile because of the `two` variable does not satisfy the require of the i32 `typedef`, which is a unsigned 32-bit integer.

## Python

Python on the other hand:

    def test_func(one, two): # notice: no explicit type specification in parameters
      return one * two
    
    def main():
      one = 4
      two = "five" # allowed
      three = test_func(one, two)
      print three
      
Surprisingly, this will compile. And even better, Python won't throw __any__ exceptions, __EVEN__ during runtime, when an interpreted language like Python can still catch errors! And running python with `-i` and `-d` yields no hidden tracebacks. No output is being printed to `stdout` or `stderr`, and you really don't know if your program ran successfully, or crashed into the pits of programmer hell.

Python, unsurprisingly, has a weak type system. No rules are implemented that check the validity of types during compile-time -  and in this case - even runtime, and frankly, there really are no explicit types. 

## So what should I do?

Matthias Endler recently wrote a great [article](http://matthias-endler.de/2017/why-type-systems-matter/) on type systems, which I picked up when browsing [lobste.rs](https://lobste.rs). However, I wanted to talk a little about my philosophy on learning programming language's that enforce a strict and strong type system.

Endler mentions:

> With types, you communicate your guarantees and expectations. 

I think this a great statement. With explicit types, not only are you able to understand your variables' types are, but also when they enter into the programming stage and take their leave. For example, the `std::string` type in C++ is a dynamically allocated implementation of the string object, while `char` arrays are stack-allocated and "raw" implementations. C++ programmers often rely on the `std::string` type when writing their code, since it is safer and throws away the risks and work having to create a character array. Using `std::string` also employs various powerful member functions, such as `rbegin()` and `rend()` through _reverse iterators_. Still, the C++ programmer may wish to dereference his/her `std::string` into a character array (dubbed as the "C-style string") when working with C-style functions. This provides the programmer an opportunity to _take control_ of their code and define the behaviors of their types.

Even when this means creating __more work__ for the programmer, it often leads up to __good style__. Rust is a poster-child programming language for this, since it is known for its __type safety__. Instead of implementing garbage collection, Rust utilizes deterministic object lifetimes, where variables and other structures created have determined "expiration dates" - or in technical terms, - lifetimes by the compiler. 

Let's take a look at how behavior like this is used in Rust's `Arc` struct, which is a reference-counting pointer implementation through Rust's standard library.
Reference-counting is a behavior that allows the management of resources and their references and pointers through a incremental/decremental _reference count_. When implemented in garbage-collection, this allows for automatic memory management and recycling.

The `Arc<T>` type and any of its pointers that are produced are _heap-allocated_. When a pointer is created for `T`, it points to the same memory location. `Deref` behavior causes the pointer to dereference into a `Weak<T>` type, which is non-owning and can act as a temporary pointer.

    use std::sync::{Arc, Weak};
    
    fn main(){
      let point_me = Arc::new(Box::new(5));
      let pointed = Arc::clone(&point_me);

      // Deref through downgrade()
      let weakened = Arc::downgrade(&point_me);
      
    } 

Overall, this provides a great way to carefully manage memory, enforcing quality coding style, especially with a unique type system like Rust's. With `Arc<T>` types, threading can be implemented, but with the variety of explicit types in Rust's standard library, the `Rc<T>` type can also be utilized for single-threaded operations. 

--- 

While I have provided several examples of why strong type systems are to be preferred, it really is up to the programmer and his/her task to figure out what language to use. Weakly-typed programming languages, often presented in the form of higher-level languages, often hide away the complexity and implications of types through levels of abstractions, providing the programmer the ability to write code for websites, apps, and other projects that turn the focus away from safety to user experience and feature-environments. While dynamic type checking and implicit type conversion allow this to occur, I suggest programmers to really take time to write some code in stronger-typed languages, or at least learn more about it. Types provide ways to idiomatically express your code, manage your resources and memory more efficient, create your own guarentees, and create your own types to represent what you want in your code and how you want it.




