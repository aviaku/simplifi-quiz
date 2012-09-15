# Benchmarks

### Naive Parser Implementation - 68a2b30ad8436001787f793cf29300fe0e50c343
    $ time node setup-datastore.js 
    Setup: successfully deleted old datastore
    Setup: successfully created new SQLite datastore
    Setup: finished parsing user data from parsed_data.txt

    real	28m31.724s
    user	0m24.538s
    sys 	0m51.155s

    $ ls -lh db/datastore.sqlite 
    -rw-rw-r-- 1 diego diego 25M Sep 14 22:04 db/datastore.sqlite

    $ time node scripts/search-by-keyword.js dallas
    Keyword Search: successfully opened /home/diego/Workspace/node/simplifi-quiz/db/datastore.sqlite
    Keyword Search: searching for UIDs that are related to keyword = dallas
		2550
		8713
		14140
		18110
		21792
		24823
		25215
		27474
		29161
		37061
		42798
		46908
		50319
		50426
		52621
		53747
		60856
		66875
		68692
		75031
		76627
		78991
		79950
		83334
    Keyword Search: 24 UIDs found

    real	0m0.432s
    user	0m0.132s
    sys    	0m0.036s

    $ time node scripts/search-by-uid.js 2550
    UID Search: successfully opened /home/diego/Workspace/node/simplifi-quiz/db/datastore.sqlite
    UID Search: searching for UID = 2550
    { ip: '74.15.80.74',
      agent: 'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1; Trident/4.0; .NET CLR 2.0.50727; .NET CLR 3.0.4506.2152; .NET CLR 3.5.30729)',
      url: 'http://www.localpages.com/results-lp.php?bcat=sar+dog+training+dallas&fd=yb&place=new+orleans%2C+LA&cid=17299&geoint=0',
      ref: 'unknown' }

    real	0m0.082s
    user	0m0.036s
    sys    	0m0.008s

