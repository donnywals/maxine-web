const appleAppSiteAssociation = {
  applinks: {
    apps: [],
    details: [
      {
        appIDs: [
          "4JMM8JMG3H.com.donnywals.ExerciseTracker",
          "4JMM8JMG3H.com.donnywals.ExerciseTracker.dev",
        ],
        components: [
          {
            "/": "/plans/*",
            comment: "Open only Maxine workout plan pages in the Maxine app.",
          },
        ],
      },
    ],
  },
};

export function appleAppSiteAssociationResponse() {
  return Response.json(appleAppSiteAssociation, {
    headers: {
      "cache-control": "public, max-age=3600",
      "content-type": "application/json",
    },
  });
}
