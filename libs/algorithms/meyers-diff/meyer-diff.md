# Meyers Diff

- Raw operations are "INSERT", "DELETE" and "KEEP"
- A replace will be "DELETE" followed by "INSERT"  
- Naive
	- Runs of "DELETE" will preceed runs of "INSERT"s
- MiddleSnake
	- Substantially more efficent
	- Runs are not stable and will interleave

Normalizing will ensure:
- INSERT / DELETE ordering is "DELETE" followed by "INSERT"
- INSERT / DELETE are grouped as runs
- REPLACE op?