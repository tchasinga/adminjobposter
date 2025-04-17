APIS documentation



1. Dashboard APIs (3)
#	Endpoint	Method	Description
1	/api/dashboard/stats	GET	Fetch summary stats (jobs, applicants)
2	/api/dashboard/applicants-chart	GET	Data for monthly applicants chart (
   			# Default (12 months, grouped by month)
        		GET /api/dashboard/applicants-chart

			# Last 6 months weekly data
			GET /api/dashboard/applicants-chart?months=6&groupBy=week

			# Last 30 days daily data
			GET /api/dashboard/applicants-chart?months=1&groupBy=day
			)


3	/api/dashboard/jobs-chart	GET	Data for job type distribution pie chart



====================================================

Job Posting APIs (4)
   /api/jobs	        GET	      List all job postings (with filters) and GET /api/jobs?poll=true (if you wanna use it)
   /api/jobs       	POST	Create new job posting
   /api/jobs/:id	DELETE	Close/delete a job and /api/jobs/[jobId]?action=close and DELETE /api/jobs/[jobId]?action=delete or /api/jobs/:id
   /api/jobs/:id	PUT	Update a job posting

======================================================

Applicants APIs (4)
 
 /api/applicants	        GET	List applicants (search/filter support) and /api/applicants?search=(Search across name, email, company, telegram) or /api/applicants?status=hired (Get all hired applicants) or /api/applicants for general get request

 /api/applicants/:id	        GET	Get single applicant details
 /api/applicants/:id/status	PUT	Update status (e.g., "hired")
 /api/applicants/export	GET	Export applicants to CSV/PDF(
    		# Export to CSV (default)
    		GET /api/applicants/export

   		 # Explicit CSV export
    		 GET /api/applicants/export?format=csv

    		# PDF export
    		GET /api/applicants/export?format=pdf)
 

=============================================================================

remember we are using mongoDb as Database our ID will always be called 
like this _id whenever we want to access any id on frontend we will
access it like this _id
   