const { projectKey } = useParams();

return (
  <>
    <ProjectTopNav projectKey={projectKey} />
    <Outlet />
  </>
);