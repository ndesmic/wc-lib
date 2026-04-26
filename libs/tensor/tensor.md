# Tensor Notes

- Operations are defined with left-packed (column major) shapes
    - This means that the value on the left (ie lowest index) has the smallest stride
    - You can also think of it as the leftmost dimension is packed first and most densely

```
[
    1,2
    3,4

    5,6,
    7,8
] : shape [2,2,2]
```
Will iterate `1,5,3,7,2,6,4,8`