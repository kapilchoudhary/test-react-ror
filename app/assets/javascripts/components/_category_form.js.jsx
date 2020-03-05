class CategoryForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      propertyArray: [],
      inherited_categories: [],
      category: this.props.category
    };
  }

  componentDidMount() {
    const { categories } = this.props;
    const { category } = this.state;
    let properties = category.properties;
    if (category.inherited_categories) {
      const inherited_categories = categories.filter(cat =>
        category.inherited_categories.includes(cat.id.toString())
      );
      const [inherited_properties] = inherited_categories.map(
        ic => ic.properties
      );
      properties = { ...properties, ...inherited_properties };
    }
    const propertyArray = [];
    for (const key in properties) {
      propertyArray.push({ name: key, type: properties[key] });
    }
    this.setState({
      propertyArray,
      inherited_categories: category.inherited_categories
    });
  }

  handleChange(e) {
    const propertyArray = this.state.propertyArray;
    const target = e.target.name.replace(/]/g, "").split("[");
    const property = propertyArray[parseInt(target[1])];
    property[target[2]] = e.target.value;
    propertyArray[parseInt(target[1])] = property;
    this.setState({ propertyArray });
  }

  handleDelete(p) {
    let propertyArray = this.state.propertyArray;
    propertyArray = propertyArray.filter(prop => prop.name !== p.name);
    this.setState({ propertyArray });
    this.updateProperties(propertyArray);
  }

  updateProperties(properties) {
    fetch(`/api/v1/categories/${this.state.category.id}/update_properties`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ category: { properties } })
    })
      .then(response => {
        return response.json();
      })
      .then(data => {
        const propertyArray = [];
        for (const key in data) {
          propertyArray.push({ name: key, type: data[key] });
        }
        this.setState({ propertyArray });
      });
  }

  updateCategory() {
    const { category, propertyArray, inherited_categories } = this.state;
    const properties = category.properties;
    const latestProperties = {};
    propertyArray.forEach(p => (latestProperties[p.name] = p.type));
    category.properties = { ...properties, ...latestProperties };
    category.inherited_categories =
      inherited_categories || category.inherited_categories;
    let url = "";
    let method = "";
    if (category.id) {
      url = `/api/v1/categories/${category.id}`;
      method = "PUT";
    } else {
      url = `/api/v1/categories`;
      method = "POST";
    }
    fetch(url, {
      method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ category })
    })
      .then(response => {
        return response.json();
      })
      .then(data => {
        const propertyArray = [];
        for (const key in data.properties) {
          propertyArray.push({ name: key, type: data.properties[key] });
        }
        this.setState({
          inherited_categories: data.inherited_categories,
          propertyArray,
          category: data
        });
      });
  }

  handleAddProperty() {
    const propertyArray = this.state.propertyArray;
    const newProperty = { name: "", type: "" };
    propertyArray.push(newProperty);
    this.setState({ propertyArray });
  }

  handleDeleteCategory() {
    const { category } = this.state;
    fetch(`/api/v1/categories/${category.id}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    })
      .then(response => {
        return response.json();
      })
      .then(data => {
        if (data.status === "OK") {
          this.props.backToCategories();
        }
      });
  }

  handleChangeName(e) {
    const category = this.state.category;
    category.name = e.target.value;
    this.setState({ category });
  }

  changeCategoryInheritance(e) {
    const { inherited_categories } = this.state;
    if (e.target.checked) inherited_categories.push(e.target.name);
    else inherited_categories.pop(e.target.name);
    this.setState({ inherited_categories: inherited_categories });
  }

  render() {
    const { propertyArray, inherited_categories, category } = this.state;
    const { categories } = this.props;
    const categoriesToBeInherited = categories.filter(
      cat => cat.category_id === category.category_id && cat.id !== category.id
    );
    return (
      <React.Fragment>
        <div className="row mt-4 mb-4">
          <div className="col-md-6 offset-3">
            <label>Category Name </label>
            <input
              className="form-control"
              onChange={e => this.handleChangeName(e)}
              type="text"
              name="name"
              value={category.name}
            />
          </div>
        </div>
        <div className="row">
          <div className="col-md-5">
            <h3 className="text-center">Manage {category.name} Inheritance</h3>
            {categoriesToBeInherited.length ? (
              categoriesToBeInherited.map(cat => {
                return (
                  <div className="form-check check-category" key={cat.id}>
                    <input
                      className="form-check-input"
                      checked={inherited_categories.includes(cat.id.toString())}
                      onChange={e => this.changeCategoryInheritance(e)}
                      name={cat.id}
                      type="checkbox"
                    />
                    <label className="form-check-label">{cat.name}</label>
                  </div>
                );
              })
            ) : (
              <div>No Categories to be Inherited.</div>
            )}
          </div>
          <div className="col-md-5">
            <h3 className="text-center">Manage {category.name} Attributes</h3>
            <table className="table table-bordered mt-3">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {propertyArray.map((p, i) => {
                  return (
                    <tr>
                      <td>
                        <input
                          className="form-control"
                          onChange={e => this.handleChange(e)}
                          type="text"
                          name={`properties[${i}][name]`}
                          value={p.name}
                        />
                      </td>
                      <td>
                        <input
                          className="form-control"
                          onChange={e => this.handleChange(e)}
                          type="text"
                          name={`properties[${i}][type]`}
                          value={p.type}
                        />
                      </td>
                      <td>
                        <button
                          onClick={() => {
                            this.handleDelete(p);
                          }}
                          className="btn btn-danger"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="col-md-2">
            <h3 className="text-center">Actions</h3>
            <div className="mt-3">
              <button
                onClick={() => this.updateCategory()}
                className="btn btn-success"
              >
                Save
              </button>
              <br />
              {category.id && (
                <React.Fragment>
                  <button
                    onClick={() => this.handleDeleteCategory()}
                    className="btn btn-danger mt-2"
                  >
                    Delete Category
                  </button>
                  <br />
                </React.Fragment>
              )}
              <button
                onClick={() => this.handleAddProperty()}
                className="btn btn-info mt-2"
              >
                Add New Property
              </button>
              <br />
              <button
                onClick={() => this.props.backToProducts()}
                className="btn btn-info mt-2"
              >
                Back to Products
              </button>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}
