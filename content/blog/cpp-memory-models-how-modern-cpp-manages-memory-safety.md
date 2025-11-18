---
title: 'C++ Memory Models - How Modern C++ Manages Memory Safety'
description:
    'Explore how modern C++ ensures memory safety with smart techniques like
    RAII and smart pointers'
pubDate: 'Nov 24 2024'
keywords: ['c++', 'cpp', 'memory-management']
---

C++ is a one of my favorite languages. It offers full control over memory and
performance. But with great power comes great responsibility. Issues like memory
leaks, dangling pointers, and race conditions is what caused the concerns over
these vulnerabilities that recently led the
[US government to discourage the use of C++](https://www.cisa.gov/resources-tools/resources/product-security-bad-practices)
in favor of safer alternatives.

But I don't think these claims are justified. Modern C++ has come a long way.
With tools like smart pointers, RAII, and thread-safe primitives introduced in
C++11 and later standards, managing memory is much safer than it used to be.
Also the static analyzers would yell at you relentlessly if you try to do manual
memory management.

## The C++ Memory Model

The C++ memory model defines the rules for how threads interact with memory,
ensuring that operations like reading and writing data happen in a predictable
way.

Before C++11, the language had no formal memory model. We had to often rely on
compiler- and platform-specific implementatios, which made multi-threaded
programming dangerous and hard to debug. C++11 changed this by introducing a
well-defined memory model, making it easier to write concurrent code without
surprises.

The C++ memory model provides:

- **Sequential Consistency**: A guarantee that operations appear to execute in
  the order they’re written. At least from the perspective of a single thread.
- **Atomic Operations**: Safe, lock-free access to shared variables, which
  eliminates common data races.
- **Memory Orderings**: Fine-grained control over how operations on memory are
  synchronized between threads.

Without a memory model, concurrent programs could behave unpredictably.
Different CPUs might reorder instructions.

## Memory Management Techniques in C++

When it comes to managing memory, C++ has all the tools we need. Along with
plenty of ways to shoot yourself in the foot if we're not careful. Going from
manual control with raw pointers to smart pointers and STL containers, memory
management in C++ has evolved to reduce the risk of common pitfalls.

### Manual Memory Management

In the pre C++11 days, you’d allocate memory with `new` and free it with
`delete`. While this gave developers complete control, it also introduced plenty
of opportunities for mistakes:

- **Memory Leaks**: Forget to call `delete`.
- **Double Delete**: Call `delete` twice.
- **Dangling Pointers**: Use a pointer after it’s been deleted.

Manual memory management is still useful in low-level code where every byte of
memory matters, but for most cases, modern C++ offers safer options.

### RAII (Resource Acquisition Is Initialization)

[RAII](https://en.cppreference.com/w/cpp/language/raii) is a confusiong way of
saying, "Tie the lifetime of your resources (e.g. memory, file, network) to the
lifetime of an object." With RAII, you don’t need to worry about explicitly
freeing resources as they’re automatically cleaned up when the object goes out
of scope.

```cpp
#include <iostream>

class Resource {
private:
    int* data;

public:
    // Constructor: Allocate memory
    Resource(int value) {
        data = new int(value);
        std::cout << "Resource acquired with value: " << *data << std::endl;
    }

    // Destructor: Free the allocated memory
    ~Resource() {
        delete data;
        std::cout << "Resource released." << std::endl;
    }

    // Member function to access the resource
    int getValue() const {
        return *data;
    }

    void setValue(int value) {
        *data = value;
    }
};

void useResource() {
    Resource res(10); // Resource is automatically acquired here
    std::cout << "Using resource with value: " << res.getValue() << std::endl;

    res.setValue(20);
    std::cout << "Resource value updated to: " << res.getValue() << std::endl;
    // Resource is automatically released here when it goes out of scope
}

int main() {
    useResource();
    return 0;
}
```

The output of the above program:

```
Resource acquired with value: 10
Using resource with value: 10
Resource value updated to: 20
Resource released.
```

### Smart Pointers

C++ introduced
[smart pointers](https://www.geeksforgeeks.org/smart-pointers-cpp/) in C++11 to
make memory management safer and convinient. There are three types:

#### [`std::unique_ptr`](https://en.cppreference.com/w/cpp/memory/unique_ptr.html)

- Ensures that only one object owns a given piece of memory.
- Automatically deletes the memory when the `unique_ptr` goes out of scope.

#### [`std::shared_ptr`](https://en.cppreference.com/w/cpp/memory/shared_ptr.html)

- Allows multiple objects to share ownership of a single piece of memory.
- Memory is only freed when the last `shared_ptr` owning it is destroyed.

#### [`std::weak_ptr`](https://en.cppreference.com/w/cpp/memory/weak_ptr.html)

- Works with `shared_ptr` to prevent circular references.
- Doesn’t contribute to the ownership count, so it won’t block memory cleanup.

### STL Containers

Containers like
[`std::vector`](https://en.cppreference.com/w/cpp/container/vector.html),
[`std::array`](https://en.cppreference.com/w/cpp/container/array.html),
[`std::map`](https://en.cppreference.com/w/cpp/container/map.html), and
[`std::string`](https://en.cppreference.com/w/cpp/string/basic_string.html)
manage their memory internally, so you don’t need to worry about allocating or
freeing memory. For most use cases, they’re the safest and most efficient
choice.

## Concurrency and Memory Safety

As soon as you introduce multiple threads into a program, memory safety becomes
a whole new problem. Threads can overwrite each other’s changes, read stale
data, or even crash the program. This is where the modern C++ memory model comes
into play by providing tools to manage memory safely in multithreaded
environments.

### Data Races

A data race happens when:

1. Two or more threads access the same memory location.
2. At least one of the accesses is a write.
3. There’s no synchronization to coordinate the access.

Here’s an example of a potential data race:

```cpp
#include <iostream>
#include <thread>

int counter = 0;

void increment() {
  for (int i = 0; i < 1000; ++i) {
    ++counter; // Not thread-safe!
  }
}

int main() {
  std::thread t1(increment);
  std::thread t2(increment);
  std::thread t3(increment);
  std::thread t4(increment);

  t1.join();
  t2.join();
  t3.join();
  t4.join();

  std::cout << "Counter value: " << counter << std::endl;
  return 0;
}

```

**Expected Output:** `4000`\
**Actual Output:** Well, mostly the expected output but running the program
multiple times would give different and occasionally wrong outputs. This the
output of 10 consecutive runs on my machine:

```
Counter value: 4000
Counter value: 4000
Counter value: 4000
Counter value: 4000
Counter value: 4000
Counter value: 3019 (**)
Counter value: 4000
Counter value: 3079 (**)
Counter value: 4000
Counter value: 4000
```

### One Possible Solution

The [`std::atomic`](https://en.cppreference.com/w/cpp/atomic/atomic.html) type
ensures that operations on shared memory are performed atomically (as
indivisible units). This eliminates data races without needing a lock.

Here’s how you fix the example above:

```cpp
...
std::atomic<int> counter = 0;

void increment() {
  for (int i = 0; i < 1000; ++i) {
    ++counter; // Thread-safe increment
  }
}

int main() {
...
```

**Output:** `2000`

The `std::atomic<int>` type ensures that all operations on `counter` are atomic.
This means threads cannot interrupt each other during an update.

### Another Approach Memory Orderings

The C++ memory model goes beyond atomicity and lets you fine-tune how operations
are synchronized between threads using
**[memory orderings](https://en.cppreference.com/w/cpp/atomic/memory_order)**.

1. **`std::memory_order_relaxed`**: Allows maximum performance but no guarantees
   about visibility between threads.
2. **`std::memory_order_acquire` and `std::memory_order_release`**: Ensure that
   reads and writes happen in a specific order.
3. **`std::memory_order_seq_cst`** (default): Provides the strongest guarantees
   of sequential consistency.

```cpp
#include <iostream>
#include <thread>
#include <atomic>

std::atomic<int> flag = 0;
int data = 0;

void writer() {
    data = 42;
    flag.store(1, std::memory_order_release);
}

void reader() {
    while (flag.load(std::memory_order_acquire) != 1) {
        // Wait until flag is set
    }
    std::cout << "Read data: " << data << std::endl;
}

int main() {
    std::thread t1(writer);
    std::thread t2(reader);

    t1.join();
    t2.join();

    return 0;
}
```

`std::memory_order_release` ensures `data = 42` is visible before `flag = 1`.
`std::memory_order_acquire` ensures the reader waits until the write is
complete.

## Conclusion

C++ gives great control and performance to the developers, but it requires great
level of attention too in order to use avoid various memory related issues.
Modern features like smart pointers and RAII make memory management easier but
it is up to the developers to use them. Languages like Rust, Go offer their own
takes. Rust focuses on safety, Go on simplicity. Both offer ways to do unsafe
code as well. It is a matter of which is the default and how easy it is to step
into unsafe territory. Ultimately it is the developers responsibility to choose
the right tool for their project.
