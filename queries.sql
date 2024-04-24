select tei.uid
from trackedentityinstance tei
left join programinstance pi using(trackedentityinstanceid)
where pi.programinstanceid = null
limit 2;


SELECT uid
FROM trackedentityinstance tei
WHERE NOT EXISTS
    (SELECT
     FROM programinstance
     WHERE trackedentityinstanceid = tei.trackedentityinstanceid )
limit 5;


SELECT tei.uid
FROM programinstance pi
inner join trackedentityinstance tei using(trackedentityinstanceid)
WHERE NOT EXISTS
    (SELECT
     FROM programstageinstance
     WHERE programinstanceid = pi.programinstanceid )
limit 5;