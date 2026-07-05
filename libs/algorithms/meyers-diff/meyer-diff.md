# Meyers Diff

Raw operations are "INSERT", "DELETE" and "KEEP".  A replace will be "DELETE" followed by "INSERT".  Runs of "DELETE" will preceed runs of "INSERTS".