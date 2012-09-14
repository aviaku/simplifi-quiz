So at Simpli.fi we see all kinds of data... and we archive, process, and analyze more than 500 GB of data every single day.

Along with this text file, is a tar gzipped archive of a sampling of the data, roughly 500,000 records in this format:

****
IP: the randomized IP
UA: the user agent string
U: url or partial url of the page the user is on
R: url or partial url of the referer
****

Example:

****
IP: 193.11.44.99
UA: Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0)
U: www.grooveshark.com
R: http://mediaservices-d.openxenterprise.com/w/1.0/afr?auid=129878&cb=INSERT_RANDOM_NUMBER_HERE
****

Note: Not all of the data will be there, in fact, any of the fields can be empty.

Here's what we want you to do:

1) Write a script (in whatever language you want), that processes and stores the data in a flat file format (txt, sqlite, bdb, custom binary. whatever just needs to be disk based). The storage should be optimized for two separate goals listed below.
2) Come up with a scheme to "identify" the user. Using the information provided, come up with an identification scheme that is repeatable and storage friendly.
3) Come up with as many pieces of information from the URL and referer as you can that could help a client decide wether or not to show an ad and store that within the datastore. (search queries, domain names, page contexts, etc.)
4) Write a script that can search for all keywords or data pieces (from #3) given an ID from that datastore (in #1).
4a) example: echo MyIDString | ruby search_by_uid.rb    (this will print out all tidbits of information based on the ID)
5) Write a script that can search for all "IDs" (generated above) that should be shown an ad based on a single keyword through STDIN (use the datastore from #1).
5a) example: echo toyota | ruby search_by_keyword.rb    (this will print out all IDs that could be shown a toyota ad)