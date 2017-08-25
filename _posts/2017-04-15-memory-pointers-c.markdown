---
title: Dynamic Memory and Pointers in C
date: 2017-04-15 00:00:00 Z
layout: post
---

If you are like me, you love to throw pointer lexicons throughout your code hoping to make all those compiler warnings go away. I mean, you might understand what pointers are, but you don't really _understand_ them.

Here's a nice rundown of how a pointer works, on a "high" level:

    #include <stdio.h>
    int main(void){
      int a = 100, *ptr;
      *ptr = a;
      printf("Memory location of *ptr: %x;\n", *ptr); 
      printf("Memory location of a: %x;",  a);

      printf("The value of (*ptr)++ is: %d", (*ptr)++ )

      /* Of course, you might be tempted to do this:
      int b, *ptr2;
      int *ptr2 = 100;
      int *ptr2 = b;

     RED FLAG! A pointer is a representation of memory, and in no way is it    
     an integer. */
     
    }


and a representation of the code in a lower level:

    &a = 0x123              &ptr = 0x456    
    -----------             ---------------
    | a = 100 | <---------- |*ptr = 0x123 |
    -----------             ---------------
        a++     <----------     (*ptr)++
    
    
Now that's nice and fun, but what is the purpose of utilizing pointers? C, unlike your modern Python and Javascript, utilizes pointers to modify data more efficiently. For example, C does not have a built-in string type, resulting in people utilizing arrays of characters, or as some people in cybersecurity call it, a _buffer_.

    char * name[100] = "Alan";

Languages such as Python aren't as __explicit__ as C, where it is not necessary to declare the type and/or cast of a variable. This makes the language much more tolerable for impatient people like me.

    name = "Alan";
    name = 1; # of course, with mutability, I can change the type easily.

Because of this, Python is _dynamically_ typed. We will explore that later.

With all this talk about pointers, it still seems a little confusing right? Let me show you one pragmatic example of using pointers in C. Let's say that I have a function, `swap()`, and it is in charge of swapping two integer values that is passed, like so: `swap(int a, int b)`. Let's write this in code, and see what we get.

    #include <stdio.h>
    
    void swap(int val1, int val2); // function prototype 
    
    void swap(int val1, int val2){  
      int temp = val1; // hold value of a in temp variable
      val1 = val2;    // change value of a to b
      val2 = temp;      // change value of b to temp, which holds the value of a.
    }
    
    int main(void){
      int a = 1, b = 2;
      printf("Before swap: a = %i; b = %i\n", a, b); 
      swap(a, b); // a represents val1, b represents val2
      printf("After swap: a = %i; b = %i\n", a, b);
    }
    
The program looks fine, but once compiled:

    $ gcc swap.c -o swap
    $ ./swap
    Before swap: a = 1; b = 2
    After swap: a = 1; b = 2

What happened? This is the work of the _stack_. When we are allocating memory on the _stack_, that memory is attached to a thread of execution. Once complete, all memory goes away. For a structure such as a function, that means that the data allocated within its scope will eventually be deallocated. That means once `swap()` finishes its thread of execution, the values (which will have been swapped) passed through parameters have fallen out of scope, and the next output will print the same as the first output, since it is in the scope of `main()`.

Of course, let's reexamine this example with pointers. 

    #include <stdio.h>

    void swap(int *val1, int *val2); 
    
    // I won't write any comments here. Try to interpret the code yourself.

    void swap(int *val1, int *val2){  
      int temp = *val1; 
      *val1 = *val2;      
      *val2 = temp;      
    }

    int main(void){
      int a = 1, b = 2;
      printf("Before swap: a = %i; b = %i\n", a, b); 
      swap(&a, &b); 
      printf("After swap: a = %i; b = %i\n", a, b);
    }
    
    ---
    
    $ gcc swap.c -o swap
    $ ./swap
    Before swap: a = 1; b = 2
    After swap: a = 2; b = 1

Remember, pointers are not individual data types, but rather a representation of memory with an origination. When we are working with `val1` and `val2`, we were simply passing the values of `a` and `b` to it, not the actual memory address. However, once we declare `*val1` and `*val2` as pointers, we can visualize an arrow that links the pointers to the memory locations of `a` and `b`, or as seen in the code, `&a`, `&b`. The rules of the stack and memory management are still enforced, but once the values within the `swap()` function falls out of scope, the values of `a` and `b` have already been swapped, through our trusty pointers.

---

With all this talk about memory, I want to introduce one more concept: dynamic memory allocation. While we were writing our code above, we have worked with _static_ types. This means that we explicitly declared each of our types, and when we compile the program, these data values, their types and sizes are recognized during __compile-time__. This enables the compiler to allocate memory safely. Going back to our comparison with C and Python: since we do not explicitly declare the types of variables and other structures in Python, it is a _dynamically_ typed language. Despite that, this does not mean that we cannot dynamically allocate memory in C. 

When we declare an array, we know that it has a fixed size of elements. It's size, type, etc. are all known to the compiler as well.

    int array[10];
    // we use %zu, since sizeof() returns size_t
    printf("Size of array[]: %zu", sizeof(array)); // => 40; 4 bits for each element

How about doing this dynamically? We use the `malloc()` function from `stdlib.h`

    #include <stdio.h>
    #include <stdlib.h>
    ...
    int * array = malloc(10 * sizeof(int)); 
    // using malloc, we allocate 40 bits, since the sizeof(int) is 4 bits.
    
    if (array == NULL) { 
      // IF however, we are unable to allocate that, the array returns NULL. This is how we would handle this.
      
      fprintf(stderr, "Could not allocate!\n"); // print to STDERR. Errno can work too.
      return(-1);
    }
    
Neat feature right? This is important, especially when you work with user input. Using dynamic memory can prevent cases of buffer and stack overflows in memory, but it is important to __free__ dynamically allocated memory. C, unlike languages like Rust and Java, does NOT have garbage collectors. 

    free(array);
    
There are of course, other methods of dynamic memory allocations in C. You may have heard of `calloc()`, which is similar to 'malloc()'.

---

So that's a litle bit of a rundown on pointers, static and dynamic memory, and dynamic memory allocation in C. 

Thanks for reading! 
