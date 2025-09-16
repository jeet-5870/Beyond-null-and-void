function ResultTable({ data }) {
  return (
    <table border="1" cellPadding="8">
      <thead>
        <tr>
          <th>Location</th>
          <th>HPI</th>
          <th>PLI</th>
          <th>MPI</th>
          <th>HEI</th>
          <th>Classification</th>
        </tr>
      </thead>
      <tbody>
        {data.map((d) => (
          <tr key={d.location}>
            <td>{d.location}</td>
            <td>{d.hpi?.toFixed(2)}</td>
            <td>{d.pli?.toFixed(2)}</td>
            <td>{d.mpi?.toFixed(2)}</td>
            <td>{d.hei?.toFixed(2)}</td>
            <td>{d.classification}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
export default ResultTable;
