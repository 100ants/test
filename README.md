# collider.js : not made yet
This is a javascript colliding libruary.
Supports Circles, Rectangles and polygons.
> Note: Do not think what it renders graphic. It's only set of math functions.

## Main system
### Classes
#### Vector2
System class for 2D point. Taken from Unity.

##### Constructor()
```javascript
constructor(x : float, y : float)
```
Create vector with x: x and y: y

##### toArray()
```javascript
Vector2.toArray(x : float, y : float)
```
Returns an array \[x, y\]. Usefull for third-party code (someone prefers array to objects)

##### x
```javascript
Vector2.x
```
X component of the vector

##### y
```javascript
Vector2.y
```
Y component of the vector

#### Vector2
